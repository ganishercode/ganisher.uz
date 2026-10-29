// Shaxsiy fayl ombori (faqat sayt egasi uchun): Vercel Blob (private) + parol bilan kirish.
// Muhit o'zgaruvchilari (Vercel → Settings → Environment Variables):
//   FAYL_PAROL            — kirish paroli (egasi o'zi qo'yadi)
//   BLOB_READ_WRITE_TOKEN — Blob omborini loyihaga ulaganda Vercel o'zi qo'shadi
// Yo'llar: GET ?a=me | GET ?a=list | GET ?a=get&p=… | POST ?a=login | POST ?a=logout | POST ?a=upload | POST ?a=del
const crypto = require("crypto");
const { Readable } = require("stream");
const { list, get, del } = require("@vercel/blob");
const { handleUpload } = require("@vercel/blob/client");

const ORIGIN = /^https?:\/\/(?:(?:www\.)?ganisher\.uz|ganisher-uz(?:-[a-z0-9-]+)?\.vercel\.app|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)$/i;
const PREFIX = "fayllar/";
const PATH_RE = /^fayllar\/[0-9a-z]{6,12}-[^/\\\u0000-\u001f]{1,200}$/;
const MAX_SIZE = 50 * 1024 * 1024;
const COOKIE = "gfayl", SESSION_DAYS = 30;
const tries = new Map();           // IP → noto'g'ri parol urinishlari vaqti (shu server nusxasi xotirasida)

const configured = () => Boolean(process.env.FAYL_PAROL && process.env.BLOB_READ_WRITE_TOKEN);
const sessionKey = () => crypto.createHash("sha256").update("ganisher-fayllar|" + process.env.FAYL_PAROL).digest();
const sign = exp => crypto.createHmac("sha256", sessionKey()).update(String(exp)).digest("base64url");

function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function loggedIn(req) {
  if (!process.env.FAYL_PAROL) return false;
  const [exp, sig] = String(cookies(req)[COOKIE] || "").split(".");
  if (!exp || !sig || !(+exp > Date.now())) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function setSession(req, res, value, maxAge) {
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(String(req.headers.host || ""));
  res.setHeader("Set-Cookie", `${COOKIE}=${value}; Path=/api/fayllar; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${local ? "" : "; Secure"}`);
}

function passwordOk(given) {
  // ikkala qiymat ham xeshlanadi — uzunlik farqi vaqt bo'yicha bilinib qolmasin
  const h = s => crypto.createHash("sha256").update(String(s)).digest();
  return crypto.timingSafeEqual(h(given), h(process.env.FAYL_PAROL));
}

const ipOf = req => String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim() || "?";
const send = (res, code, obj) => { res.setHeader("Cache-Control", "no-store"); res.status(code).json(obj); };

module.exports = async (req, res) => {
  const a = String(req.query?.a || new URL(req.url, "http://x").searchParams.get("a") || "");
  const q = k => req.query?.[k] ?? new URL(req.url, "http://x").searchParams.get(k);

  if (req.method === "POST") {
    // barcha POST faqat saytning o'zidan (onUploadCompleted ishlatilmaydi, shuning uchun Blob'dan qaytuvchi chaqiruv yo'q)
    if (!ORIGIN.test(String(req.headers.origin || ""))) return send(res, 403, { error: "origin" });
  } else if (req.method !== "GET") return send(res, 405, { error: "method" });

  if (a === "me") return send(res, 200, { configured: configured(), loggedIn: configured() && loggedIn(req) });
  if (!configured()) return send(res, 503, { error: "not_configured" });

  if (a === "login" && req.method === "POST") {
    const ip = ipOf(req), now = Date.now();
    const recent = (tries.get(ip) || []).filter(t => now - t < 15 * 60e3);
    if (recent.length >= 8) return send(res, 429, { error: "limit" });
    const body = typeof req.body === "object" && req.body ? req.body : {};
    if (!passwordOk(body.parol || "")) {
      recent.push(now); tries.set(ip, recent);
      await new Promise(r => setTimeout(r, 600));
      return send(res, 401, { error: "wrong" });
    }
    tries.delete(ip);
    const exp = now + SESSION_DAYS * 864e5;
    setSession(req, res, `${exp}.${sign(exp)}`, SESSION_DAYS * 86400);
    return send(res, 200, { ok: true });
  }
  if (a === "logout" && req.method === "POST") { setSession(req, res, "", 0); return send(res, 200, { ok: true }); }

  if (a === "upload" && req.method === "POST") {
    try {
      const out = await handleUpload({
        body: req.body, request: req,
        onBeforeGenerateToken: async pathname => {
          if (!loggedIn(req)) throw new Error("auth");
          if (!PATH_RE.test(pathname)) throw new Error("bad_name");
          return { maximumSizeInBytes: MAX_SIZE, addRandomSuffix: false, allowOverwrite: false, validUntil: Date.now() + 30 * 60e3 };
        },
      });
      return send(res, 200, out);
    } catch (e) {
      const code = e.message === "auth" ? 401 : 400;
      return send(res, code, { error: e.message === "auth" || e.message === "bad_name" ? e.message : "upload" });
    }
  }

  if (!loggedIn(req)) return send(res, 401, { error: "auth" });

  try {
    if (a === "list" && req.method === "GET") {
      const files = []; let cursor;
      do {
        const r = await list({ prefix: PREFIX, limit: 1000, cursor });
        for (const b of r.blobs) files.push({ p: b.pathname, size: b.size, at: b.uploadedAt });
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor);
      files.sort((x, y) => new Date(y.at) - new Date(x.at));
      return send(res, 200, { files, max: MAX_SIZE });
    }

    if (a === "get" && req.method === "GET") {
      const p = String(q("p") || "");
      if (!PATH_RE.test(p)) return send(res, 400, { error: "bad_name" });
      const r = await get(p, { access: "private" });
      if (!r || r.statusCode !== 200) return send(res, 404, { error: "not_found" });
      const name = p.slice(PREFIX.length).replace(/^[0-9a-z]+-/, "");
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${name.replace(/[^\x20-\x7e]|["\\]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(name)}`);
      if (r.blob.size != null) res.setHeader("Content-Length", String(r.blob.size));
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "private, no-store");
      res.statusCode = 200;
      Readable.fromWeb(r.stream).pipe(res);
      return;
    }

    if (a === "del" && req.method === "POST") {
      const p = String((req.body && req.body.p) || "");
      if (!PATH_RE.test(p)) return send(res, 400, { error: "bad_name" });
      await del(p);
      return send(res, 200, { ok: true });
    }
  } catch (e) {
    console.error("fayllar:", a, e && e.message);
    return send(res, 502, { error: "storage" });
  }
  return send(res, 404, { error: "unknown" });
};
