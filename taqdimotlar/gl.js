(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $('.stage'), slides = $$('.slide');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  let cur = -1;

  /* ---------- kinetik matn: .k ichidagi so'zlarni bo'laklaymiz ---------- */
  slides.forEach(s => $$('.k', s).forEach(el => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const f = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { f.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w'; w.textContent = p; w.style.setProperty('--i', i++); f.append(w);
        });
        ch.replaceWith(f);
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
    });
    walk(el);
  }));

  /* ---------- grafiklar: <svg class="chart" data-chart="kalit"> ---------- */
  const fmt = (v, d = 0) => v.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/ /g, ' ').replace('.', ',');
  const el = (tag, at, txt) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; };
  function niceMax(m) { const p = Math.pow(10, Math.floor(Math.log10(m))); for (const k of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (k * p >= m) return k * p; return 10 * p; }
  function axisY(g, x0, x1, y0, y1, lo, hi, n, f) {
    for (let i = 0; i <= n; i++) {
      const v = lo + (hi - lo) * i / n, y = y1 - (v - lo) / (hi - lo) * (y1 - y0);
      g.append(el('line', { x1: x0, x2: x1, y1: y, y2: y, stroke: Math.abs(v) < 1e-9 ? '#111' : '#d4d4d0', 'stroke-width': Math.abs(v) < 1e-9 ? 1.6 : 1, 'stroke-dasharray': Math.abs(v) < 1e-9 ? '' : '4 5' }));
      g.append(el('text', { x: x0 - 10, y: y + 5, 'text-anchor': 'end', 'font-size': 14, fill: '#8a8a86' }, f(v)));
    }
  }
  const BUILD = {
    /* guruhlangan ustunlar: {cats, series:[{name,color,vals}], unit, dec} */
    bars(svg, c, W, H) {
      const x0 = 70, x1 = W - 10, y0 = 20, y1 = H - 40;
      const all = c.series.flatMap(s => s.vals), mx = niceMax(Math.max(...all)), mn = Math.min(0, ...all) < 0 ? -niceMax(-Math.min(...all)) : 0;
      axisY(svg, x0, x1, y0, y1, mn, mx, 4, v => fmt(v, c.axdec || 0));
      const gw = (x1 - x0) / c.cats.length, bw = Math.min(64, gw * .7 / c.series.length);
      let k = 0;
      c.cats.forEach((cat, i) => {
        const cx = x0 + gw * (i + .5);
        c.series.forEach((s, j) => {
          const v = s.vals[i]; if (v == null) return;
          const x = cx - bw * c.series.length / 2 + j * bw + 3, yv = y1 - (v - mn) / (mx - mn) * (y1 - y0), yz = y1 - (0 - mn) / (mx - mn) * (y1 - y0);
          const r = el('rect', { class: 'cb', x, y: Math.min(yv, yz), width: bw - 6, height: Math.abs(yz - yv), fill: s.color }); r.style.setProperty('--i', k);
          if (v < 0) r.style.transformOrigin = '50% 0';
          svg.append(r);
          const t = el('text', { class: 'lab', x: x + (bw - 6) / 2, y: v >= 0 ? yv - 8 : yv + 18, 'text-anchor': 'middle', 'font-size': c.series.length > 1 ? 13 : 16, 'font-weight': 700, fill: '#111' }, fmt(v, c.dec || 0)); t.style.setProperty('--i', k);
          svg.append(t); k++;
        });
        svg.append(el('text', { x: cx, y: y1 + 26, 'text-anchor': 'middle', 'font-size': 15, fill: '#555', 'font-weight': 600 }, cat));
      });
    },
    /* chiziqlar: {cats, series:[{name,color,vals,dash}], dec} */
    lines(svg, c, W, H) {
      const x0 = 60, x1 = W - 40, y0 = 20, y1 = H - 40;
      const all = c.series.flatMap(s => s.vals).filter(v => v != null);
      const mx = c.max ?? niceMax(Math.max(...all)), mn = c.min ?? Math.min(0, Math.floor(Math.min(...all)));
      axisY(svg, x0, x1, y0, y1, mn, mx, c.ticks || 4, v => fmt(v, c.axdec || 0) + (c.suf || ''));
      const X = i => x0 + (x1 - x0) * (i + .5) / c.cats.length, Y = v => y1 - (v - mn) / (mx - mn) * (y1 - y0);
      c.cats.forEach((cat, i) => svg.append(el('text', { x: X(i), y: y1 + 26, 'text-anchor': 'middle', 'font-size': 15, fill: '#555', 'font-weight': 600 }, cat)));
      let k = 0;
      c.series.forEach(s => {
        const pts = s.vals.map((v, i) => [X(i), Y(v)]);
        svg.append(el('polyline', { class: 'ln', pathLength: 1, points: pts.map(p => p.join(',')).join(' '), fill: 'none', stroke: s.color, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-dasharray': s.dash || '' }));
        pts.forEach(([x, y], i) => {
          const g = el('g', { class: 'lab' }); g.style.setProperty('--i', k++);
          g.append(el('circle', { cx: x, cy: y, r: 6, fill: '#fff', stroke: s.color, 'stroke-width': 3.5 }));
          g.append(el('text', { x, y: y + (s.below ? 26 : -14), 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: s.color }, fmt(s.vals[i], c.dec ?? 1) + (c.suf || '')));
          svg.append(g);
        });
      });
    },
    /* gorizontal juftlik: {rows:[{name, a, b}], A:{name,color}, B:{name,color}, dec, log} */
    hbars(svg, c, W, H) {
      const x0 = 210, x1 = W - 110, rowH = (H - 10) / c.rows.length;
      let k = 0;
      c.rows.forEach((r, i) => {
        const y = 10 + i * rowH, mx = Math.max(r.a, r.b);
        svg.append(el('text', { x: 0, y: y + rowH / 2 + 2, 'font-size': 16, 'font-weight': 700, fill: '#111' }, r.name));
        [[r.a, c.A.color, 0], [r.b, c.B.color, 1]].forEach(([v, col, j]) => {
          const w = Math.max(3, (x1 - x0) * v / mx), yy = y + 8 + j * (rowH / 2 - 6);
          const b = el('rect', { class: 'hb', x: x0, y: yy, width: w, height: rowH / 2 - 14, fill: col }); b.style.setProperty('--i', k);
          const t = el('text', { class: 'lab', x: x0 + w + 10, y: yy + rowH / 4, 'font-size': 15, 'font-weight': 700, fill: col }, (r.pre || '') + fmt(v, r.dec ?? 0) + (r.suf || '')); t.style.setProperty('--i', k);
          svg.append(b, t); k++;
        });
      });
    }
  };
  $$('svg.chart').forEach(svg => {
    const c = (window.CHARTS || {})[svg.dataset.chart]; if (!c) return;
    const [, , W, H] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
    BUILD[c.type](svg, c, W, H);
  });

  /* ---------- doimiy qatlamlar ---------- */
  const grid = document.createElement('div'); grid.className = 'grid';
  const vign = document.createElement('div'); vign.className = 'vign';
  const BLOB = '<svg viewBox="0 0 200 200"><path fill="#111" d="M100 18c18 0 22 40 40 46s48-14 54 4-30 30-30 48 30 40 16 52-40-14-58-10-34 40-52 28 6-44-6-58-50-10-46-30 40-8 52-24-8-56 30-56z"/></svg>';
  const blobs = [0, 1].map(i => { const b = document.createElement('div'); b.className = 'blob'; b.innerHTML = BLOB; b.style.width = b.style.height = (i ? 230 : 300) + 'px'; return b; });
  const mark = document.createElement('div'); mark.className = 'mark'; mark.innerHTML = '<b>Global iqtisodiy rivojlanish</b> · Avstraliya';
  stage.prepend(grid, vign); stage.append(...blobs, mark);
  const BPOS = [[1160, 560, 560, -250], [1120, -180, -190, 590], [-190, 560, 1160, -170], [1130, 540, -180, -160], [560, -240, -200, 610], [-215, 600, 1170, 290]];
  const prog = document.createElement('div'); prog.className = 'prog';
  const notebox = document.createElement('div'); notebox.className = 'notebox';
  const bar = document.createElement('div'); bar.className = 'bar';
  bar.innerHTML = '<a href="index.html" title="Bosh sahifa">⌂</a><button data-k="prev" title="Oldingi (←)">‹</button><span class="cnt"></span><button data-k="next" title="Keyingi (→)">›</button><button data-k="notes" title="Maʼruza matni (N)">Matn</button><button data-k="full" title="Toʻliq ekran (F)">⛶ Toʻliq ekran</button>';
  document.body.append(prog, notebox, bar);
  const cnt = $('.cnt', bar);

  function go(n, instant) {
    n = Math.max(0, Math.min(slides.length - 1, n)); if (n === cur) return;
    const prev = slides[cur], next = slides[n], d = n > cur ? 1 : -1;
    if (prev) {
      prev.classList.remove('on', 'in'); prev.classList.add('out');
      const done = () => prev.classList.remove('out');
      if (reduce || instant) done();
      else prev.animate([{ opacity: 1, filter: 'blur(0)', transform: 'none' }, { opacity: 0, filter: 'blur(14px)', transform: `translateY(${-d * 70}px) scale(1.04)` }], { duration: 520, easing: 'cubic-bezier(.7,0,.8,.4)', fill: 'both' }).finished.then(a => { a.cancel(); done(); });
    }
    cur = n;
    next.classList.add('on'); next.classList.remove('in');
    void next.offsetWidth;
    setTimeout(() => next.classList.add('in'), reduce || instant ? 0 : 260);
    // kamera: katak qog'oz va xira shakllar siljiydi
    grid.style.transform = `translate(${(n % 4) * -40}px, ${n * -120 % 400}px)`;
    const p = BPOS[n % BPOS.length];
    blobs[0].style.transform = `translate(${p[0]}px, ${p[1]}px) rotate(${n * 47}deg)`;
    blobs[1].style.transform = `translate(${p[2]}px, ${p[3]}px) rotate(${-n * 63}deg)`;
    const hide = next.hasAttribute('data-noblob'); blobs.forEach(b => b.style.opacity = hide ? 0 : 1);
    cnt.textContent = `${n + 1} / ${slides.length}`;
    prog.style.transform = `scaleX(${(n + 1) / slides.length})`;
    const note = $('.notes', next); notebox.innerHTML = note ? note.innerHTML : '';
    history.replaceState(null, '', '#' + (n + 1));
    $$('[data-count]', next).forEach(countUp);
  }
  function countUp(e) {
    const to = parseFloat(e.dataset.count), dec = +(e.dataset.dec || 0), t0 = performance.now() + 500;
    if (reduce) { e.textContent = fmt(to, dec); return; }
    e.textContent = fmt(0, dec);
    const step = now => { const k = Math.min(1, Math.max(0, (now - t0) / 1400)), v = to * (1 - Math.pow(1 - k, 3)); e.textContent = fmt(v, dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }

  /* ---------- boshqaruv ---------- */
  const toggleNotes = () => { notebox.classList.toggle('show'); $('[data-k=notes]', bar).classList.toggle('on', notebox.classList.contains('show')); };
  const toggleFull = () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); };
  bar.addEventListener('click', e => { const k = e.target.dataset && e.target.dataset.k; if (k === 'prev') go(cur - 1); if (k === 'next') go(cur + 1); if (k === 'notes') toggleNotes(); if (k === 'full') toggleFull(); });
  stage.addEventListener('click', e => {
    const t = e.target;
    const f = t.closest('.flip'); if (f) { f.classList.toggle('open'); return; }
    const ra = t.closest('[data-revealall]'); if (ra) { const cs = $$('.flip', ra.closest('.slide')), o = cs.some(c => !c.classList.contains('open')); cs.forEach(c => c.classList.toggle('open', o)); ra.textContent = o ? 'Hammasini yopish' : 'Hammasini ochish'; return; }
    const g = t.closest('[data-go]'); if (g) { const k = slides.indexOf(document.getElementById(g.dataset.go)); if (k >= 0) go(k); return; }
    if (t.closest('a,button')) return;
    const r = stage.getBoundingClientRect(); go(cur + ((e.clientX - r.left) / r.width < .18 ? -1 : 1));
  });
  addEventListener('keydown', e => {
    const k = e.key;
    if ((k === ' ' || k === 'Enter') && e.target.closest('button,a')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') go(0); else if (k === 'End') go(slides.length - 1);
    else if (k === 'f' || k === 'F') toggleFull(); else if (k === 'n' || k === 'N') toggleNotes();
  });
  let tx = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); });
  let ht; addEventListener('mousemove', () => { bar.classList.add('show'); clearTimeout(ht); ht = setTimeout(() => bar.classList.remove('show'), 2200); });
  addEventListener('hashchange', () => { const n = (parseInt(location.hash.slice(1), 10) || 1) - 1; if (n !== cur) go(n); });
  const fit = () => { stage.style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 1280, innerHeight / 720)})`; };
  addEventListener('resize', fit); fit();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => go((parseInt(location.hash.slice(1), 10) || 1) - 1, true));
})();
