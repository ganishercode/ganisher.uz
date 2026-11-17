(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $('.stage'), slides = $$('.slide');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = -1;

  /* ---------- tayyorlash: sarlavhani soʻzlarga boʻlish, navbat raqamlari ---------- */
  function splitWords(el) {
    let k = 0;
    const walk = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('i'); i.textContent = part; i.style.setProperty('--k', k++);
            w.append(i); frag.append(w);
          });
          ch.replaceWith(frag);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
      });
    };
    walk(el);
  }
  let sec = '', word = '';
  slides.forEach(s => {
    $$('h1,h2,.bigq', s).forEach(splitWords);
    $$('.r,.rx,.rl', s).forEach((el, k) => el.style.setProperty('--k', k));
    if (s.dataset.sec) sec = s.dataset.sec; s._sec = sec;
    if (s.dataset.word) word = s.dataset.word; s._word = word;
  });

  /* ---------- doimiy qatlamlar ---------- */
  const mk = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; };
  const orbs = ['a', 'b', 'c'].map(k => mk('div', 'orb ' + k));
  const haze = mk('div', 'haze'), mq = mk('div', 'mq'), grain = mk('div', 'grain');
  const cv = document.createElement('canvas'); cv.id = 'crowd'; cv.width = 1280; cv.height = 720;
  const top = mk('div', 'top', '<b>kraud<i>.</i></b><span class="ln"></span><span class="sc"></span>');
  const foot = mk('div', 'foot', '<span>Gʻoya. Olomon. Natija.</span><span><b class="no"></b> / ' + String(slides.length).padStart(2, '0') + '</span>');
  stage.prepend(haze, ...orbs, mq, cv, grain);
  stage.append(top, foot);

  const ORB = [
    ['0,0', '0,0', '0,0'], ['-420px,120px', '160px,-90px', '-640px,-380px'], ['-760px,260px', '900px,-420px', '-200px,-60px'],
    ['-140px,420px', '420px,-520px', '-900px,40px'], ['-560px,-60px', '80px,60px', '-420px,-420px'], ['120px,220px', '1080px,-80px', '-760px,-200px']
  ];

  /* ---------- olomon: nuqtalar shaklga yigʻiladi ---------- */
  const N = 260, ctx = cv.getContext('2d');
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const P = Array.from({ length: N }, (_, i) => ({ x: rnd() * 1280, y: rnd() * 720, tx: 0, ty: 0, a: 0, ta: 0, r: 1.6 + rnd() * 2.2, ph: rnd() * 6.28, sp: .04 + rnd() * .05, hot: rnd() < .35 }));
  const disc = (cx, cy, r, n, out) => { for (let i = 0; i < n; i++) { const t = i * 2.39996, q = r * Math.sqrt((i + .5) / n); out.push([cx + q * Math.cos(t), cy + q * Math.sin(t)]); } };
  const glyphPts = (txt, cx, cy, size, n) => {
    const c = document.createElement('canvas'); c.width = 520; c.height = 520; const g = c.getContext('2d');
    g.font = `800 ${size}px Manrope, "Segoe UI", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 260, 270);
    const d = g.getImageData(0, 0, 520, 520).data, pts = [];
    for (let y = 0; y < 520; y += 6) for (let x = 0; x < 520; x += 6) if (d[(y * 520 + x) * 4 + 3] > 120) pts.push([cx - 260 + x, cy - 260 + y]);
    const out = []; for (let i = 0; i < n; i++) out.push(pts.length ? pts[Math.floor(i * pts.length / n)] : [cx, cy]); return out;
  };
  const F = {
    scatter: () => { let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; return { a: .5, pts: Array.from({ length: N }, () => [r() * 1280, r() * 720]) }; },
    faint: () => { const f = F.scatter(); f.a = .16; return f; },
    right: () => { let s = 21; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; return { a: .75, pts: Array.from({ length: N }, () => [760 + r() * 480, 90 + r() * 540]) }; },
    q: () => ({ a: .95, pts: glyphPts('?', 1040, 380, 470, N) }),
    bulb: () => { const o = []; disc(1030, 320, 150, 200, o); for (let i = 0; i < 60; i++) o.push([985 + (i % 10) * 10, 485 + Math.floor(i / 10) * 11]); return { a: .95, pts: o }; },
    split: () => { const o = []; disc(330, 560, 70, 130, o); disc(960, 560, 70, 130, o); return { a: .3, pts: o }; },
    ring: () => ({ a: .9, pts: Array.from({ length: N }, (_, i) => { const t = i / N * 6.283, r = 150 + (i % 3) * 12; return [1040 + r * Math.cos(t), 390 + r * Math.sin(t)]; }) }),
    coin: () => ({ a: .95, pts: glyphPts('$', 1040, 380, 430, N) }),
    line: () => ({ a: .35, pts: Array.from({ length: N }, (_, i) => [80 + (i / N) * 1120, 670 + Math.sin(i * .5) * 8]) }),
    rise: () => ({ a: .8, pts: Array.from({ length: N }, (_, i) => { const c = i % 13, h = 2 + c * 1.5, r = Math.floor(i / 13); return [820 + c * 30, 620 - (r % Math.ceil(h)) * 22 - (r >= h ? 0 : 0)]; }) }),
    uz: () => ({ a: .9, pts: glyphPts('UZ', 1010, 400, 250, N) }),
    check: () => ({ a: .9, pts: glyphPts('✓', 1050, 380, 420, N) }),
    warn: () => ({ a: .85, pts: glyphPts('!', 1080, 380, 470, N) }),
    none: () => { const f = F.scatter(); f.a = 0; return f; }
  };
  const cache = {};
  function crowd(name) {
    const f = cache[name] || (cache[name] = (F[name] || F.faint)());
    P.forEach((p, i) => { const t = f.pts[i % f.pts.length]; p.tx = t[0]; p.ty = t[1]; p.ta = f.a; });
  }
  let tick = 0;
  function draw() {
    tick += 1;
    ctx.clearRect(0, 0, 1280, 720);
    for (const p of P) {
      p.x += (p.tx - p.x) * p.sp; p.y += (p.ty - p.y) * p.sp; p.a += (p.ta - p.a) * .06;
      if (p.a < .01) continue;
      const wx = Math.sin(tick * .012 + p.ph) * 2.4, wy = Math.cos(tick * .015 + p.ph * 1.7) * 2.4;
      ctx.globalAlpha = p.a * (.55 + .45 * Math.sin(tick * .02 + p.ph));
      ctx.fillStyle = p.hot ? '#ff7a2a' : '#d9b592';
      ctx.beginPath(); ctx.arc(p.x + wx, p.y + wy, p.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  /* ---------- oʻtishlar ---------- */
  const EASE = 'cubic-bezier(.7,0,.2,1)';
  const TR = {
    rise: d => [[{ transform: `translateY(${d * 100}%)` }, { transform: 'none' }], 900],
    wipe: d => [[{ clipPath: d > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', transform: `translateX(${d * 90}px)` }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], 1000],
    iris: () => [[{ clipPath: 'circle(0% at 78% 46%)' }, { clipPath: 'circle(150% at 78% 46%)' }], 1100],
    zoom: () => [[{ transform: 'scale(1.22)', filter: 'blur(14px)', opacity: 0 }, { transform: 'none', filter: 'blur(0)', opacity: 1 }], 900],
    flipx: d => [[{ transform: `perspective(1600px) rotateY(${d * 70}deg) translateX(${d * 30}%)`, opacity: 0 }, { transform: 'perspective(1600px) rotateY(0) translateX(0)', opacity: 1 }], 950],
    drop: d => [[{ transform: `translateY(${-d * 60}%) rotate(${-d * 5}deg)`, opacity: 0 }, { transform: 'none', opacity: 1 }], 900]
  };
  const ORDER = ['wipe', 'rise', 'iris', 'zoom', 'flipx', 'drop'];

  function go(n, instant) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur) return;
    const prev = slides[cur], next = slides[n], d = n > cur ? 1 : -1;
    if (prev) {
      $$('video', prev).forEach(v => v.pause());
      prev.classList.remove('active', 'in'); prev.classList.add('leaving');
      const done = () => prev.classList.remove('leaving');
      if (reduce || instant) done();
      else prev.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `scale(.94) translateY(${-d * 24}px)` }], { duration: 420, easing: 'ease-in', fill: 'both' }).finished.then(a => { a.cancel(); done(); });
    }
    cur = n;
    next.classList.add('active'); next.classList.remove('in');
    closeColl(next);
    const name = next.dataset.tr || ORDER[n % ORDER.length];
    if (!reduce && !instant && prev) {
      const [kf, dur] = TR[name](d);
      next.animate(kf, { duration: dur, easing: EASE, delay: 180, fill: 'backwards' });
    }
    void next.offsetWidth; next.classList.add('in');

    // doimiy qatlamlar slaydga moslashadi
    crowd(next.dataset.crowd || 'faint');
    const o = ORB[n % ORB.length]; orbs.forEach((el, i) => { el.style.transform = `translate(${o[i]})`; });
    if (mq.textContent !== next._word) mq.textContent = next._word;
    if (!reduce) mq.animate([{ transform: `translateX(${d * 520}px)`, opacity: 0 }, { transform: `translateX(${-(n % 5) * 90}px)`, opacity: 1 }], { duration: 1700, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    $('.sc', top).textContent = next._sec;
    $('.no', foot).textContent = String(n + 1).padStart(2, '0');
    cnt.textContent = `${n + 1} / ${slides.length}`;
    prog.style.transform = `scaleX(${(n + 1) / slides.length})`;
    const note = $('.notes', next); notebox.innerHTML = note ? note.innerHTML : '';
    history.replaceState(null, '', '#' + (n + 1));
    $$('[data-count]', next).forEach(countUp);
  }

  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now() + 700;
    const fmt = v => v.toFixed(dec).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    if (reduce) { el.textContent = fmt(to); return; }
    el.textContent = fmt(0);
    const step = now => {
      const p = Math.min(1, Math.max(0, (now - t0) / 1500)), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (p < 1 && slides[cur].contains(el)) requestAnimationFrame(step); else el.textContent = fmt(to);
    };
    requestAnimationFrame(step);
  }

  /* ---------- kolleksiya: karta kattalashib ochiladi ---------- */
  $$('.coll').forEach(c => {
    const cards = $$('.cd', c), n = cards.length, w = 210, gap = (1152 - n * w) / (n - 1);
    cards.forEach((cd, i) => {
      cd.style.setProperty('--x', Math.round(i * (w + gap)) + 'px');
      cd.style.setProperty('--y', (i % 2 ? 34 : 6) + 'px');
      cd.style.setProperty('--rot', ((i - (n - 1) / 2) * 3).toFixed(1) + 'deg');
      const no = document.createElement('span'); no.className = 'no'; no.textContent = String(i + 1).padStart(2, '0'); cd.append(no);
    });
    const dots = mk('div', 'dots'); cards.forEach(() => dots.append(document.createElement('i'))); c.append(dots);
    c._cards = cards; c._i = -1;
  });
  function openColl(c, i) {
    c._i = i;
    c._cards.forEach((cd, k) => cd.classList.toggle('open', k === i));
    $$('.dots i', c).forEach((d, k) => d.classList.toggle('on', k === i));
    if (i < 0) c.removeAttribute('data-open'); else c.setAttribute('data-open', '');
  }
  function closeColl(slide) { $$('.coll', slide).forEach(c => openColl(c, -1)); }
  function step(d) {
    const c = $('.coll', slides[cur]);
    if (c) {
      const i = c._i + d;
      if (i >= 0 && i < c._cards.length) { openColl(c, i); return; }
      if (d < 0 && c._i >= 0) { openColl(c, -1); return; }
    }
    go(cur + d);
  }

  /* ---------- boshqaruv paneli ---------- */
  const prog = mk('div', 'prog'), notebox = mk('div', 'notebox');
  const bar = mk('div', 'bar',
    '<a href="index.html" title="Bosh sahifa">⌂</a><button data-k="prev" title="Oldingi (←)">‹</button><span class="cnt"></span>' +
    '<button data-k="next" title="Keyingi (→)">›</button><button data-k="notes" title="Maʼruza matni (N)">Matn</button>' +
    '<button data-k="full" title="Toʻliq ekran (F)">⛶ Toʻliq ekran</button>');
  document.body.append(prog, notebox, bar);
  const cnt = $('.cnt', bar);
  const toggleNotes = () => { notebox.classList.toggle('show'); $('[data-k=notes]', bar).classList.toggle('on', notebox.classList.contains('show')); };
  const toggleFull = () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); };
  bar.addEventListener('click', e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k === 'prev') step(-1); if (k === 'next') step(1); if (k === 'notes') toggleNotes(); if (k === 'full') toggleFull();
  });

  /* ---------- bosishlar ---------- */
  stage.addEventListener('click', e => {
    const t = e.target;
    const dot = t.closest('.dots i');
    if (dot) { const c = dot.closest('.coll'); openColl(c, [...dot.parentElement.children].indexOf(dot)); return; }
    const cd = t.closest('.coll .cd');
    if (cd) { const c = cd.closest('.coll'); const i = c._cards.indexOf(cd); openColl(c, c._i === i ? -1 : i); return; }
    const f = t.closest('.flip'); if (f) { f.classList.toggle('open'); return; }
    const ra = t.closest('[data-revealall]');
    if (ra) { const cs = $$('.flip', ra.closest('.slide')), open = cs.some(c => !c.classList.contains('open')); cs.forEach(c => c.classList.toggle('open', open)); ra.textContent = open ? 'Hammasini yopish' : 'Hammasini ochish'; return; }
    const g = t.closest('[data-go]'); if (g) { const k = slides.indexOf(document.getElementById(g.dataset.go)); if (k >= 0) go(k); return; }
    const cb = t.closest('.ctr button'); if (cb) { const b = $('b', cb.parentElement); b.textContent = Math.max(0, (+b.textContent || 0) + (+cb.dataset.d)); return; }
    const tm = t.closest('[data-timer]'); if (tm) { timer(tm); return; }
    if (t.closest('video,a,button,label,input,.vid')) return;
    const r = stage.getBoundingClientRect();
    step((e.clientX - r.left) / r.width < 0.18 ? -1 : 1);
  });
  function timer(btn) {
    const out = $('output', btn.parentElement);
    if (btn._t) { clearInterval(btn._t); btn._t = null; btn.textContent = '▶ Davom etish'; return; }
    if (btn._left == null || btn._left <= 0) btn._left = +btn.dataset.timer;
    btn.textContent = '❚❚ Toʻxtatish';
    const show = () => { out.textContent = `${String(Math.floor(btn._left / 60)).padStart(2, '0')}:${String(btn._left % 60).padStart(2, '0')}`; };
    show();
    btn._t = setInterval(() => { btn._left -= 1; show(); if (btn._left <= 0) { clearInterval(btn._t); btn._t = null; btn.textContent = '↻ Qayta boshlash'; out.textContent = 'Vaqt tugadi'; } }, 1000);
  }
  $$('.vid').forEach(box => {
    const v = $('video', box), inp = $('input[type=file]', box);
    v.addEventListener('loadedmetadata', () => box.classList.add('ok'));
    if (inp) inp.addEventListener('change', () => { if (inp.files[0]) { v.src = URL.createObjectURL(inp.files[0]); v.load(); } });
  });
  addEventListener('keydown', e => {
    const k = e.key;
    if ((k === ' ' || k === 'Enter') && e.target.closest('button,a,video,label,input')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); step(-1); }
    else if (k === 'Home') go(0); else if (k === 'End') go(slides.length - 1);
    else if (k === 'f' || k === 'F') toggleFull(); else if (k === 'n' || k === 'N') toggleNotes();
  });
  let tx = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
  let hideT;
  addEventListener('mousemove', () => { bar.classList.add('show'); clearTimeout(hideT); hideT = setTimeout(() => bar.classList.remove('show'), 2200); });
  addEventListener('hashchange', () => { const n = (parseInt(location.hash.slice(1), 10) || 1) - 1; if (n !== cur) go(n); });
  const fit = () => { stage.style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 1280, innerHeight / 720)})`; };
  addEventListener('resize', fit); fit();

  const start = () => { go((parseInt(location.hash.slice(1), 10) || 1) - 1, true); requestAnimationFrame(draw); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
