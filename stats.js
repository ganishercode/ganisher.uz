/* ==========================================================================
   FOYDALANUVCHILAR HISOBLAGICHI
   Test tuzuvchi, Obyektivka va Krossvorddan nechta odam foydalanganini sanaydi
   va sahifa tepasida ko'rsatadi.

   - Hisob bepul Abacus API'da saqlanadi (abacus.jasoncameron.dev), kalit kerak emas.
   - "Foydalandi" = xizmatda haqiqiy amal bajarildi (test/krossvord tuzildi,
     PDF/Word yuklab olindi, chop etildi). Har bir brauzer har bir xizmatda
     faqat bir marta sanaladi — ya'ni bu "odamlar soni", sahifa ochilishi emas.
   - ganisher.uz dan boshqa joyda (kompyuterda sinash) alohida "dev" hisob ishlatiladi,
     haqiqiy son buzilmaydi.

   Ishlatilishi (HTML):
     <div data-stats="home"></div>          — bosh sahifadagi umumiy panel
     <div data-stats="test"></div>          — xizmat sahifasidagi panel (test | obyektivka | krossvord)
     <span data-stats-card="test"></span>   — kartadagi kichik yozuv
     <script src="stats.js" defer></script>
   ========================================================================== */
(function () {
  "use strict";

  const API = "https://abacus.jasoncameron.dev";
  const LIVE = /(^|\.)ganisher\.uz$/.test(location.hostname);
  const NS = LIVE ? "ganisher-uz" : "ganisher-uz-dev";
  const TOOLS = ["test", "obyektivka", "krossvord"];
  // xizmat sahifasida qaysi tugmalar "foydalanish" deb sanaladi
  const TRIGGERS = {
    test: "#tGen, #tRegen, #tPdf, #tDoc, #tCopy, #tPrint, #tQuiz",
    krossvord: "#btnGen, #btnRegen, #btnPdf, #btnDoc, #btnCopy, #btnPrint",
    obyektivka: "#btnPdf, #btnDoc, #btnPrint",
  };
  const REFRESH_MS = 60000;

  const TXT = {
    uz: { live: "Jonli", total: "Xizmatlardan foydalanganlar:", people: "kishi", here: "Bu xizmatdan foydalanganlar:", all: "Barcha xizmatlar:",
          card: "kishi foydalandi", names: { test: "Test tuzuvchi", obyektivka: "Obyektivka", krossvord: "Krossvord" }, you: "Siz ham qo'shildingiz!" },
    ru: { live: "Онлайн", total: "Воспользовались сервисами:", people: "чел.", here: "Этим сервисом воспользовались:", all: "Все сервисы:",
          card: "чел. воспользовались", names: { test: "Тесты", obyektivka: "Объективка", krossvord: "Кроссворд" }, you: "Вы тоже с нами!" },
    en: { live: "Live", total: "People who used our tools:", people: "people", here: "People who used this tool:", all: "All tools:",
          card: "people used it", names: { test: "Test maker", obyektivka: "Obyektivka", krossvord: "Crossword" }, you: "You're in too!" },
  };
  const lang = () => (TXT[document.documentElement.lang] ? document.documentElement.lang : "uz");
  const fmt = n => new Intl.NumberFormat(lang() === "en" ? "en-US" : "ru-RU").format(Math.max(0, Math.round(n)));

  /* ---------- saqlash (localStorage bo'lmasa ham ishlaydi) ---------- */
  const mem = {};
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { delete mem[k]; } },
  };
  let counts = {};
  try { counts = JSON.parse(store.get("gs-cache-" + NS) || "{}"); } catch (e) { counts = {}; }
  const loaded = () => TOOLS.some(t => typeof counts[t] === "number");
  const total = () => TOOLS.reduce((s, t) => s + (counts[t] || 0), 0);

  /* ---------- API ---------- */
  async function getCount(tool) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(`${API}/get/${NS}/${tool}`, { signal: ctl.signal, cache: "no-store" });
      if (r.status === 404) return 0;                    // hali hech kim foydalanmagan
      if (!r.ok) return null;
      const j = await r.json(); return typeof j.value === "number" ? j.value : null;
    } catch (e) { return null; } finally { clearTimeout(timer); }
  }
  async function hit(tool) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(`${API}/hit/${NS}/${tool}`, { signal: ctl.signal, cache: "no-store" });
      if (!r.ok) return null;
      const j = await r.json(); return typeof j.value === "number" ? j.value : null;
    } catch (e) { return null; } finally { clearTimeout(timer); }
  }
  async function refresh() {
    const vals = await Promise.all(TOOLS.map(getCount));
    let changed = false;
    vals.forEach((v, i) => { if (v !== null && v !== counts[TOOLS[i]]) { counts[TOOLS[i]] = v; changed = true; } });
    if (changed || !loaded()) { store.set("gs-cache-" + NS, JSON.stringify(counts)); }
    render();
  }

  /* ---------- foydalanishni qayd qilish ---------- */
  const usedKey = tool => `gs-used-${NS}-${tool}`;
  let busy = {};
  async function used(tool) {
    if (!TOOLS.includes(tool) || store.get(usedKey(tool)) || busy[tool]) return;
    busy[tool] = true; store.set(usedKey(tool), String(Date.now()));
    const v = await hit(tool);
    busy[tool] = false;
    if (v === null) { store.del(usedKey(tool)); return; }      // tarmoq xatosi — keyingi amalda qayta urinadi
    counts[tool] = v; store.set("gs-cache-" + NS, JSON.stringify(counts));
    render(); celebrate(tool);
  }

  /* ---------- ko'rinish ---------- */
  const CSS = `
.gs{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;padding:12px 18px;border-radius:16px;background:linear-gradient(90deg,rgba(245,184,61,.10),rgba(245,184,61,.03) 60%,rgba(255,255,255,.02));
  border:1px solid rgba(245,184,61,.28);font-family:"Plus Jakarta Sans","Inter",system-ui,sans-serif;color:#fff;font-size:15px;line-height:1.3;position:relative;overflow:hidden}
.gs[hidden]{display:none}
.gs::after{content:"";position:absolute;inset:0 auto 0 -40%;width:40%;background:linear-gradient(100deg,transparent,rgba(245,184,61,.10),transparent);animation:gs-sheen 6s ease-in-out infinite;pointer-events:none}
@keyframes gs-sheen{0%,60%{transform:translateX(0)}100%{transform:translateX(450%)}}
.gs-live{display:inline-flex;align-items:center;gap:8px;padding:4px 10px 4px 8px;border-radius:999px;background:rgba(46,204,113,.12);color:#4ade80;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.gs-live i{position:relative;width:8px;height:8px;border-radius:50%;background:#22c55e;display:block}
.gs-live i::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid #22c55e;opacity:0;animation:gs-ping 2s ease-out infinite}
@keyframes gs-ping{0%{transform:scale(.5);opacity:.8}100%{transform:scale(1.7);opacity:0}}
.gs-main{display:inline-flex;align-items:baseline;gap:8px;font-weight:600;color:#e9e9e9}
.gs-main b{font-size:22px;font-weight:800;color:#F5B83D;font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.gs-sep{width:1px;height:22px;background:rgba(255,255,255,.12)}
.gs-list{display:flex;flex-wrap:wrap;gap:8px}
.gs-chip{display:inline-flex;align-items:baseline;gap:6px;padding:5px 12px;border-radius:999px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:13px;font-weight:600;color:#cfcfcf}
.gs-chip b{color:#fff;font-weight:800;font-variant-numeric:tabular-nums}
.gs-chip.on{border-color:rgba(245,184,61,.45);color:#F5B83D}
.gs-you{position:absolute;right:14px;top:50%;font-size:13px;font-weight:800;color:#0A0A0A;background:#F5B83D;padding:5px 12px;border-radius:999px;opacity:0;pointer-events:none;
  transform:translateY(-30%) scale(.9);transition:opacity .35s,transform .45s cubic-bezier(.34,1.56,.64,1);z-index:1}
.gs-you.show{opacity:1;transform:translateY(-50%)}
.gs-bump{animation:gs-bump .7s cubic-bezier(.34,1.56,.64,1)}
@keyframes gs-bump{0%{transform:scale(1)}35%{transform:scale(1.25)}100%{transform:scale(1)}}
.gs-card{display:inline-flex;align-items:center;gap:7px;align-self:flex-start;font-size:13px;font-weight:600;color:#cfcfcf}
.gs-card[hidden]{display:none}
.gs-card:not([hidden]){margin-top:auto}.gs-card:not([hidden])+.edu-cta{margin-top:0}
.gs-card i{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18);display:block}
.gs-card b{color:#F5B83D;font-weight:800;font-variant-numeric:tabular-nums}
@media (max-width:640px){.gs{padding:12px 14px;gap:10px 12px}.gs-sep{display:none}.gs-main{flex-wrap:wrap}.gs-main b{font-size:20px}
  .gs-you{top:12px;right:12px;transform:translateY(6px) scale(.9)}.gs-you.show{transform:none}}
@media (prefers-reduced-motion:reduce){.gs::after,.gs-live i::after{animation:none}.gs-bump{animation:none}}`;

  const shown = {};          // ekranda ko'rinib turgan sonlar (sanab o'sish uchun)
  function tween(el, key, to) {
    const from = shown[key] ?? (loaded() ? to : 0);
    shown[key] = to;
    if (from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), d = Math.min(1600, 500 + Math.abs(to - from) * 8);
    const step = now => { const p = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  function build() {
    if (!document.getElementById("gs-style")) { const s = document.createElement("style"); s.id = "gs-style"; s.textContent = CSS; document.head.appendChild(s); }
    document.querySelectorAll("[data-stats]").forEach(slot => {
      const mode = slot.dataset.stats, L = TXT[lang()];
      slot.className = "gs"; slot.setAttribute("role", "status"); slot.setAttribute("aria-live", "polite");
      if (mode === "home") {
        slot.innerHTML = `<span class="gs-live"><i></i><span>${L.live}</span></span>
          <span class="gs-main"><span>${L.total}</span><b data-n="total">0</b><span>${L.people}</span></span><span class="gs-sep"></span>
          <span class="gs-list">${TOOLS.map(t => `<span class="gs-chip">${L.names[t]} <b data-n="${t}">0</b></span>`).join("")}</span><span class="gs-you">${L.you}</span>`;
      } else {
        slot.innerHTML = `<span class="gs-live"><i></i><span>${L.live}</span></span>
          <span class="gs-main"><span>${L.here}</span><b data-n="${mode}">0</b><span>${L.people}</span></span><span class="gs-sep"></span>
          <span class="gs-chip on">${L.all} <b data-n="total">0</b></span><span class="gs-you">${L.you}</span>`;
      }
      slot.hidden = !loaded();
    });
    document.querySelectorAll("[data-stats-card]").forEach(c => {
      c.className = "gs-card"; c.innerHTML = `<i></i><b data-n="${c.dataset.statsCard}">0</b><span>${TXT[lang()].card}</span>`; c.hidden = !loaded();
    });
    Object.keys(shown).forEach(k => delete shown[k]);
  }

  function render() {
    if (!loaded()) return;
    document.querySelectorAll("[data-stats], [data-stats-card]").forEach(el => { el.hidden = false; });
    document.querySelectorAll("[data-n]").forEach(el => {
      const k = el.dataset.n, v = k === "total" ? total() : (counts[k] || 0);
      tween(el, k + "@" + (el.closest("[data-stats]")?.dataset.stats || el.closest("[data-stats-card]")?.dataset.statsCard || ""), v);
    });
  }

  function celebrate(tool) {
    document.querySelectorAll(`[data-n="${tool}"], [data-n="total"]`).forEach(el => {
      el.classList.remove("gs-bump"); void el.offsetWidth; el.classList.add("gs-bump"); });
    document.querySelectorAll(".gs-you").forEach(el => { el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 4000); });
  }

  /* ---------- ishga tushirish ---------- */
  function init() {
    build(); render(); refresh();
    setInterval(() => { if (document.visibilityState === "visible") refresh(); }, REFRESH_MS);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refresh(); });
    // til almashganda (bosh sahifa) yozuvlar qayta chiziladi
    new MutationObserver(() => { build(); render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    // xizmat sahifasida: haqiqiy amal bajarilganda bir marta sanaladi
    const page = document.querySelector("[data-stats]:not([data-stats='home'])")?.dataset.stats;
    if (page && TRIGGERS[page]) document.addEventListener("click", e => { if (e.target.closest(TRIGGERS[page])) used(page); }, true);
  }
  window.GStats = { used, refresh };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
