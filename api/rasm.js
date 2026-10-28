// Rasm → Excel: rasmdagi hamma matn va jadvallarni Gemini AI orqali o'qiydi. Rasm hech qayerda saqlanmaydi.
// Kerakli sozlama (Vercel → loyiha → Settings → Environment Variables):
//   GEMINI_API_KEY  — majburiy (https://aistudio.google.com/app/apikey)
//   GEMINI_MODEL    — ixtiyoriy, standart: gemini-3.5-flash-lite
// Xizmat hammaga ochiq, shuning uchun kalit sarflanmasligi uchun: faqat ganisher.uz sahifasidan kelgan so'rov,
// bitta IP'dan 10 daqiqada cheklangan son, rasm 4 MB gacha.

const PROMPT = `
You transcribe photos of paper documents into structured text: printed forms, invoices, waybills, receipts,
handwritten notebooks, letters, inventory sheets, registers, notes. Text may be in Russian, Uzbek (Latin or Cyrillic)
or English. The photo may be taken at an angle, rotated, curled or in poor light — still read it.

Transcribe EVERYTHING that is written in the image — not only tables. Return it as "blocks" in reading order
(top to bottom, left to right):
- {"type":"text","text":"..."} for any text that is not a table: titles, document number and date, company names,
  addresses, requisites, "from/to", paragraphs, notes, totals written in words, signature lines, captions.
  Put lines that belong together into one block and separate lines with "\\n". Start a new text block where the
  document visually starts a new part (for example the text above a table and the text below it are different blocks).
- {"type":"table","columns":[...],"rows":[[...],...]} for every table (ruled or clearly aligned in columns).

Rules:
1. Copy text exactly as written: same language, spelling, numbers, leading zeros, units and signs. Do not translate,
   summarize, calculate, reformat or "fix" anything. Do not invent anything. Do not skip anything readable,
   including small print and handwritten notes.
2. Tables: "columns" are the headers exactly as written (multi-level headers joined with " / "; no header row →
   "Ustun 1", "Ustun 2", ...). "rows" are data rows top to bottom, each an array with exactly one string per column.
   Keep total rows (Итого, Jami). Empty cell → "". A merged cell spanning several rows: repeat its value in each row.
3. Handwritten text and numbers must be read too. A handwritten value inside a table column belongs to that column.
   If handwritten numbers are written in a margin or an unlabeled column next to printed table rows (for example counted
   quantities next to a printed inventory list), add one extra column named "Количество от руки" for them.
   Never overwrite a printed value with a handwritten one. Handwritten notes outside tables go into text blocks.
4. Stamps and seals: put their readable text into a text block starting with "Muhr: ". A signature → "(imzo)".
5. Illegible or uncertain words → write "[?]" in their place and mention it in "notes".
6. If the image contains no text at all, return an empty "blocks" array and explain why in "notes".
7. "notes": a short message to the user in Uzbek (Latin script) about problems (blurry, cut off, illegible parts).
   Empty string if everything was read well.
`;

const SCHEMA = {
  type: "OBJECT",
  properties: {
    blocks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["text", "table"] },
          text: { type: "STRING" },
          columns: { type: "ARRAY", items: { type: "STRING" } },
          rows: { type: "ARRAY", items: { type: "ARRAY", items: { type: "STRING" } } },
        },
        required: ["type"],
      },
    },
    notes: { type: "STRING" },
  },
  required: ["blocks", "notes"],
};

const MAX_BYTES = 4 * 1024 * 1024;
const MIME = /^image\/(jpeg|png|webp|heic|heif)$/;
const ORIGIN = /^https?:\/\/(?:(?:www\.)?ganisher\.uz|ganisher-uz(?:-[a-z0-9-]+)?\.vercel\.app|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)$/i;
const WINDOW_MS = 10 * 60 * 1000, PER_IP = 12;
const hits = new Map();           // IP → so'nggi so'rovlar vaqti (shu server nusxasi xotirasida)

function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= PER_IP) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

const normColumn = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");

/** AI qaytargan jadvalni tozalaydi: bo'sh/takror ustun nomlari farqlanadi, bo'sh qatorlar olib tashlanadi. */
function cleanTable(columns, rows) {
  const rawRows = (Array.isArray(rows) ? rows : []).filter(Array.isArray);
  const width = Math.max(Array.isArray(columns) ? columns.length : 0, ...rawRows.map((r) => r.length), 0);
  const seen = new Map();
  const cols = Array.from({ length: width }, (_, i) => {
    const name = String((columns || [])[i] ?? "").trim() || `Ustun ${i + 1}`;
    const n = (seen.get(normColumn(name)) || 0) + 1;
    seen.set(normColumn(name), n);
    return n > 1 ? `${name} (${n})` : name;
  });
  const clean = rawRows.map((r) => cols.map((_, i) => String(r[i] ?? "").trim())).filter((r) => r.some((v) => v !== ""));
  return cols.length && clean.length ? { columns: cols, rows: clean } : null;
}

async function readImage(base64, mimeType) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { status: 503, body: { error: "not_configured" } };
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 55000);
  let res;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      signal: ctl.signal,
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: SCHEMA },
      }),
    });
  } catch (e) {
    console.error("Gemini so'rovi:", e && e.name);
    return { status: 504, body: { error: "ai_timeout" } };
  } finally { clearTimeout(timer); }
  if (!res.ok) {
    console.error("Gemini", res.status, (await res.text()).slice(0, 500));
    return { status: 502, body: { error: res.status === 429 ? "ai_limit" : "ai" } };
  }
  const data = await res.json();
  const text = ((data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [])
    .map((p) => p.text || "").join("");
  let out;
  try {
    const cleaned = text.replace(/```json|```/g, "");
    out = JSON.parse(cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1));
  } catch {
    console.error("Gemini JSON emas:", text.slice(0, 300));
    return { status: 502, body: { error: "ai" } };
  }
  const blocks = [];
  for (const b of Array.isArray(out.blocks) ? out.blocks : []) {
    if (b && b.type === "table") {
      const t = cleanTable(b.columns, b.rows);
      if (t) blocks.push({ type: "table", ...t });
    } else if (b && typeof b.text === "string" && b.text.trim()) {
      blocks.push({ type: "text", text: b.text.replace(/\r\n/g, "\n").trim() });
    }
  }
  return { status: 200, body: { blocks, notes: typeof out.notes === "string" ? out.notes.trim() : "" } };
}

module.exports = async (req, res) => {
  const origin = String(req.headers.origin || "");
  const allowed = ORIGIN.test(origin);
  if (allowed) { res.setHeader("Access-Control-Allow-Origin", origin); res.setHeader("Vary", "Origin"); }
  res.setHeader("Cache-Control", "no-store");
  const send = (status, body) => res.status(status).json(body);

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    return res.status(204).end();
  }
  if (req.method !== "POST") return send(405, { error: "method" });
  if (!allowed) return send(403, { error: "origin" });

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim() || "?";
  if (limited(ip)) return send(429, { error: "limit" });

  const body = typeof req.body === "string" ? (() => { try { return JSON.parse(req.body); } catch { return null; } })() : req.body;
  const image = body && typeof body.image === "string" ? body.image.replace(/^data:[^,]*,/, "") : "";
  const mime = body && typeof body.mime === "string" ? body.mime : "";
  if (!image || !MIME.test(mime)) return send(400, { error: "bad_image" });
  if (image.length * 0.75 > MAX_BYTES) return send(413, { error: "too_large" });

  const r = await readImage(image, mime);
  return send(r.status, r.body);
};
