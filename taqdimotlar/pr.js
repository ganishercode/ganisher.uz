(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const slides = $$('.slide');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  let cur = -1;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  /* ---------- boshqaruv paneli (pastda, telefonda ham qulay) ---------- */
  const prog = document.createElement('div'); prog.className = 'prog'; prog.innerHTML = '<i></i>';
  const bar = document.createElement('nav'); bar.className = 'bar'; bar.setAttribute('aria-label', 'Slaydlar');
  bar.innerHTML = '<a class="home" href="index.html" title="Bosh sahifa" aria-label="Bosh sahifa">⌂</a>'
    + '<button type="button" data-k="prev" aria-label="Назад">‹</button><span class="cnt" aria-live="polite"></span><button type="button" data-k="next" aria-label="Вперёд">›</button>'
    + '<div class="lang" role="group" aria-label="Til / Язык"><button type="button" data-l="ru">RU</button><button type="button" data-l="uz">UZ</button></div>'
    + '<button type="button" class="full" data-k="full" aria-label="Во весь экран">⛶</button>';
  document.body.append(prog, bar);
  const cnt = $('.cnt', bar), progI = $('i', prog);
  if (!document.documentElement.requestFullscreen) $('.full', bar).hidden = true;

  /* ---------- til: RU / UZ ---------- */
  function setLang(l) {
    document.body.classList.toggle('lang-uz', l === 'uz');
    $$('.lang button', bar).forEach(b => { b.classList.toggle('on', b.dataset.l === l); b.setAttribute('aria-pressed', b.dataset.l === l); });
    document.documentElement.lang = l === 'uz' ? 'uz' : 'ru';
    store.set('pr-deck-lang', l);
  }
  setLang(store.get('pr-deck-lang') === 'uz' ? 'uz' : 'ru');

  /* ---------- qadamlar ---------- */
  slides.forEach(s => { s._steps = $$('[data-step]', s).sort((a, b) => a.dataset.step - b.dataset.step); s._i = 0; });
  function reveal(el) {
    if (el.classList.contains('msg')) {
      el.classList.add('shown', 'show');
      const txt = $('.txt', el), typ = $('.typing', el);
      if (!reduce && typ && txt) { txt.hidden = true; typ.hidden = false; setTimeout(() => { typ.hidden = true; txt.hidden = false; el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 650); }
      requestAnimationFrame(() => el.classList.add('vis'));
    } else el.classList.add('show');
    setTimeout(() => el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }), 60);
  }
  const hide = el => el.classList.remove('show', 'shown', 'vis');
  function resetSteps(s) { s._steps.forEach(hide); s._i = 0; }
  function step(d, pt) {
    const s = slides[cur];
    if (d > 0 && s._i < s._steps.length) {
      const n = s._steps[s._i].dataset.step;
      while (s._i < s._steps.length && s._steps[s._i].dataset.step === n) reveal(s._steps[s._i++]);
      return;
    }
    go(cur + d, false, pt);
  }

  /* ---------- o'tish: nuqtadan doira bo'lib ochiladi (tinish belgisi g'oyasi) ---------- */
  function go(n, instant, pt) {
    n = Math.max(0, Math.min(slides.length - 1, n)); if (n === cur) return;
    const prev = slides[cur], next = slides[n], fwd = n > cur;
    stopPlay();
    slides.forEach(s => { if (s !== prev && s !== next) { s.classList.remove('on', 'in', 'top'); s.setAttribute('aria-hidden', 'true'); } });
    if (prev) prev.classList.remove('top');
    resetSteps(next);
    $$('.open', next).forEach(e => e.classList.remove('open'));
    $$('[data-showall],[data-types]', next).forEach(b => b.classList.remove('on'));
    next.classList.remove('show-all', 'types', 'in');
    next.scrollTop = 0;
    next.classList.add('on', 'top'); next.setAttribute('aria-hidden', 'false');
    cur = n;
    if (prev && !instant && !reduce) {
      const W = innerWidth, H = innerHeight;
      const x = pt ? pt.x : (fwd ? W - 60 : 60), y = pt ? pt.y : H - 40;
      const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
      next.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)` }], { duration: 720, easing: 'cubic-bezier(.7,0,.2,1)' })
        .finished.then(() => { if (slides[cur] !== prev) { prev.classList.remove('on', 'in'); prev.setAttribute('aria-hidden', 'true'); } });
      setTimeout(() => { if (slides[cur] === next) next.classList.add('in'); }, 260);
    } else {
      if (prev) { prev.classList.remove('on', 'in'); prev.setAttribute('aria-hidden', 'true'); }
      requestAnimationFrame(() => next.classList.add('in'));
    }
    cnt.textContent = `${n + 1} / ${slides.length}`;
    progI.style.transform = `scaleX(${(n + 1) / slides.length})`;
    history.replaceState(null, '', '#' + (n + 1));
  }

  /* ---------- bosishlar ---------- */
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.l) return setLang(b.dataset.l);
    const k = b.dataset.k;
    if (k === 'prev') step(-1); else if (k === 'next') step(1);
    else if (k === 'full') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});
  });
  document.addEventListener('click', e => {
    if (e.target.closest('.bar')) return;
    const t = e.target, s = slides[cur];
    const fl = t.closest('.flip'); if (fl) { fl.classList.toggle('open'); fl.setAttribute('aria-expanded', fl.classList.contains('open')); return; }
    const sa = t.closest('[data-showall]'); if (sa) { s.classList.toggle('show-all'); sa.classList.toggle('on', s.classList.contains('show-all')); return; }
    const ty = t.closest('[data-types]'); if (ty) { s.classList.toggle('types'); ty.classList.toggle('on', s.classList.contains('types')); return; }
    if (t.closest('[data-next]')) return step(1);
    if (t.closest('[data-restart]')) { stopPlay(); return resetSteps(s); }
    const pl = t.closest('[data-play]'); if (pl) return play(pl);
    if (t.closest('a,button,input,label')) return;
    if (coarse) return;                         // telefonda bosish varaqlamaydi — o'qish/aylantirishga xalaqit bermasin
    if (String(getSelection()).length) return;
    step(e.clientX < innerWidth * .15 ? -1 : 1, { x: e.clientX, y: e.clientY });
  });
  let timer = null, playBtn = null;
  function stopPlay() { if (timer) clearInterval(timer); timer = null; if (playBtn) playBtn.classList.remove('on'); playBtn = null; }
  function play(btn) {
    if (timer) return stopPlay();
    const s = slides[cur]; if (s._i >= s._steps.length) resetSteps(s);
    playBtn = btn; btn.classList.add('on'); step(1);
    timer = setInterval(() => { const sl = slides[cur]; if (sl !== s || sl._i >= sl._steps.length) return stopPlay(); step(1); }, 2600);
  }
  addEventListener('keydown', e => {
    const k = e.key;
    if ((k === ' ' || k === 'Enter') && e.target.closest('button,a')) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); step(-1); }
    else if (k === 'Home') go(0); else if (k === 'End') go(slides.length - 1);
    else if (k === 'f' || k === 'F') { if (!$('.full', bar).hidden) $('.full', bar).click(); }
    else if (k === 'l' || k === 'L') setLang(document.body.classList.contains('lang-uz') ? 'ru' : 'uz');
  });
  /* telefonda chapga/o'ngga surish */
  let tx = null, ty0 = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty0; tx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  });
  addEventListener('hashchange', () => { const n = (parseInt(location.hash.slice(1), 10) || 1) - 1; if (n !== cur) go(n); });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => go((parseInt(location.hash.slice(1), 10) || 1) - 1, true));
})();
