(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $('.stage'), slides = $$('.slide');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = -1;

  /* ---------- til: RU / UZ ---------- */
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const lang = document.createElement('div'); lang.className = 'lang'; lang.setAttribute('role', 'group'); lang.setAttribute('aria-label', 'Til / Язык');
  lang.innerHTML = '<button type="button" data-l="ru">RU</button><button type="button" data-l="uz">UZ</button>';
  stage.append(lang);
  function setLang(l) {
    document.body.classList.toggle('lang-uz', l === 'uz');
    $$('button', lang).forEach(b => { b.classList.toggle('on', b.dataset.l === l); b.setAttribute('aria-pressed', b.dataset.l === l); });
    document.documentElement.lang = l === 'uz' ? 'uz' : 'ru';
    store.set('ru-deck-lang', l);
  }
  setLang(store.get('ru-deck-lang') === 'uz' ? 'uz' : 'ru');
  lang.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { e.stopPropagation(); setLang(b.dataset.l); } });

  /* ---------- qadamlar: slayd ichidagi [data-step] elementlar navbat bilan ochiladi ---------- */
  slides.forEach(s => { s._steps = $$('[data-step]', s).sort((a, b) => a.dataset.step - b.dataset.step); s._i = 0; });
  function showStep(el) {
    if (el.classList.contains('msg')) {
      el.classList.add('shown');
      const bub = $('.bub', el), txt = $('.txt', el), typ = $('.typing', el);
      if (!reduce && typ && txt) { txt.hidden = true; typ.hidden = false; }
      requestAnimationFrame(() => el.classList.add('vis'));
      if (!reduce && typ && txt) setTimeout(() => { typ.hidden = true; txt.hidden = false; }, 650);
      const chat = el.closest('.chat'); if (chat) chat.scrollTop = chat.scrollHeight;
    } else el.classList.add('show');
  }
  function hideStep(el) { el.classList.remove('show', 'vis', 'shown'); }
  function resetSteps(s) { s._steps.forEach(hideStep); s._i = 0; }
  function step(d) {
    const s = slides[cur];
    if (d > 0 && s._i < s._steps.length) {
      // bir xil raqamli qadamlar birga ochiladi
      const n = s._steps[s._i].dataset.step;
      while (s._i < s._steps.length && s._steps[s._i].dataset.step === n) showStep(s._steps[s._i++]);
      return;
    }
    if (d < 0 && s._i > 0 && s.hasAttribute('data-back-steps')) {
      const n = s._steps[s._i - 1].dataset.step;
      while (s._i > 0 && s._steps[s._i - 1].dataset.step === n) hideStep(s._steps[--s._i]);
      return;
    }
    go(cur + d);
  }

  /* ---------- o'tish: daftar varag'i ochiladi ---------- */
  function go(n, instant) {
    n = Math.max(0, Math.min(slides.length - 1, n)); if (n === cur) return;
    const prev = slides[cur], next = slides[n], fwd = n > cur;
    if (prev) {
      prev.classList.remove('on', 'in'); prev.classList.add('out');
      const done = () => prev.classList.remove('out');
      if (reduce || instant) done();
      else if (fwd) prev.animate([{ transform: 'rotateY(0)', filter: 'brightness(1)' }, { transform: 'rotateY(-100deg)', filter: 'brightness(.7)' }], { duration: 800, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'both' }).finished.then(a => { a.cancel(); done(); });
      else prev.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(60px)' }], { duration: 450, easing: 'ease-in', fill: 'both' }).finished.then(a => { a.cancel(); done(); });
    }
    if (prev && !fwd && !reduce && !instant) {
      next.classList.add('out');
      next.animate([{ transform: 'rotateY(-100deg)', filter: 'brightness(.7)' }, { transform: 'rotateY(0)', filter: 'brightness(1)' }], { duration: 800, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'backwards' }).finished.then(() => next.classList.remove('out'));
    }
    cur = n;
    resetSteps(next);
    $$('.vw.open', next).forEach(v => v.classList.remove('open'));
    next.classList.remove('show-all');
    next.classList.add('on'); next.classList.remove('in'); void next.offsetWidth;
    setTimeout(() => next.classList.add('in'), reduce || instant ? 0 : (prev && fwd ? 380 : 120));
    if (next.hasAttribute('data-autostep')) setTimeout(() => { if (slides[cur] === next && next._i === 0) step(1); }, reduce || instant ? 0 : 900);
    cnt.textContent = `${n + 1} / ${slides.length}`;
    prog.style.transform = `scaleX(${(n + 1) / slides.length})`;
    const note = $('.notes', next); notebox.innerHTML = note ? note.innerHTML : '';
    history.replaceState(null, '', '#' + (n + 1));
  }

  /* ---------- boshqaruv ---------- */
  const prog = document.createElement('div'); prog.className = 'prog';
  const notebox = document.createElement('div'); notebox.className = 'notebox';
  const bar = document.createElement('div'); bar.className = 'bar';
  bar.innerHTML = '<a href="index.html" title="Bosh sahifa">⌂</a><button data-k="prev" title="Назад (←)">‹</button><span class="cnt"></span><button data-k="next" title="Вперёд (→)">›</button><button data-k="notes" title="Заметки (N)">Matn</button><button data-k="full" title="Во весь экран (F)">⛶</button>';
  document.body.append(prog, notebox, bar);
  const cnt = $('.cnt', bar);
  const toggleNotes = () => { notebox.classList.toggle('show'); $('[data-k=notes]', bar).classList.toggle('on', notebox.classList.contains('show')); };
  const toggleFull = () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); };
  bar.addEventListener('click', e => { const k = e.target.dataset && e.target.dataset.k; if (k === 'prev') step(-1); if (k === 'next') step(1); if (k === 'notes') toggleNotes(); if (k === 'full') toggleFull(); });

  stage.addEventListener('click', e => {
    const t = e.target;
    const vw = t.closest('.vw'); if (vw) { vw.classList.toggle('open'); return; }
    const all = t.closest('[data-allwords]');
    if (all) { const ws = $$('.vw', all.closest('.slide')), open = ws.some(w => !w.classList.contains('open')); ws.forEach(w => w.classList.toggle('open', open)); all.classList.toggle('on', open); return; }
    const sh = t.closest('[data-showall]'); if (sh) { const s = sh.closest('.slide'); s.classList.toggle('show-all'); sh.classList.toggle('on', s.classList.contains('show-all')); return; }
    const nx = t.closest('[data-next]'); if (nx) { step(1); return; }
    const rs = t.closest('[data-restart]'); if (rs) { resetSteps(slides[cur]); return; }
    const pl = t.closest('[data-play]'); if (pl) { play(pl); return; }
    const g = t.closest('[data-go]'); if (g) { const k = slides.indexOf(document.getElementById(g.dataset.go)); if (k >= 0) go(k); return; }
    if (t.closest('a,button')) return;
    const r = stage.getBoundingClientRect(); step((e.clientX - r.left) / r.width < .18 ? -1 : 1);
  });
  let timer = null;
  function play(btn) {
    if (timer) { clearInterval(timer); timer = null; btn.classList.remove('on'); return; }
    const s = slides[cur]; if (s._i >= s._steps.length) resetSteps(s);
    btn.classList.add('on'); step(1);
    timer = setInterval(() => { const sl = slides[cur]; if (sl !== s || sl._i >= sl._steps.length) { clearInterval(timer); timer = null; btn.classList.remove('on'); return; } step(1); }, 2600);
  }
  addEventListener('keydown', e => {
    const k = e.key;
    if ((k === ' ' || k === 'Enter') && e.target.closest('button,a')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); step(-1); }
    else if (k === 'Home') go(0); else if (k === 'End') go(slides.length - 1);
    else if (k === 'f' || k === 'F') toggleFull(); else if (k === 'n' || k === 'N') toggleNotes();
    else if (k === 'l' || k === 'L') setLang(document.body.classList.contains('lang-uz') ? 'ru' : 'uz');
  });
  let tx = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
  let ht; addEventListener('mousemove', () => { bar.classList.add('show'); clearTimeout(ht); ht = setTimeout(() => bar.classList.remove('show'), 2200); });
  addEventListener('hashchange', () => { const n = (parseInt(location.hash.slice(1), 10) || 1) - 1; if (n !== cur) go(n); });
  const fit = () => { stage.style.transform = `translate(-50%,-50%) scale(${Math.min(innerWidth / 1280, innerHeight / 720)})`; };
  addEventListener('resize', fit); fit();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => go((parseInt(location.hash.slice(1), 10) || 1) - 1, true));
})();
