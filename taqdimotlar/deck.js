(() => {
  const stage = document.querySelector('.stage');
  const slides = [...document.querySelectorAll('.slide')];
  const audioSrc = document.body.dataset.audio;
  let cur = 0;

  // har bir slayd ichidagi animatsiya navbatini avtomatik belgilash
  slides.forEach(s => {
    s.querySelectorAll('.a,.gy,.gx').forEach((el, k) => {
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', k);
    });
    parseVars(s).forEach(([k, v]) => s.style.setProperty(k, v));
  });

  function parseVars(s) {
    return (s.dataset.vars || '').split(';').map(p => p.split(':').map(x => x.trim())).filter(p => p.length === 2 && p[0]);
  }

  // boshqaruv paneli
  const prog = el('div', 'prog');
  const notebox = el('div', 'notebox');
  const bar = el('div', 'bar');
  bar.innerHTML =
    '<a href="index.html" title="Bosh sahifa">⌂</a>' +
    '<button data-k="prev" title="Oldingi (←)">‹</button>' +
    '<span class="cnt"></span>' +
    '<button data-k="next" title="Keyingi (→)">›</button>' +
    (audioSrc ? '<button data-k="audio" title="Ovozli kirish (A)">▶ Ovoz</button>' : '') +
    '<button data-k="notes" title="Maʼruza matni (N)">Matn</button>' +
    '<button data-k="full" title="Toʻliq ekran (F)">⛶ Toʻliq ekran</button>';
  document.body.append(prog, notebox, bar);
  const cnt = bar.querySelector('.cnt');
  const audio = audioSrc ? new Audio(audioSrc) : null;
  const aBtn = bar.querySelector('[data-k=audio]');
  if (audio) {
    audio.addEventListener('ended', () => setAudio(false));
    audio.addEventListener('pause', () => setAudio(false, true));
  }

  function el(tag, cls) { const e = document.createElement(tag); e.className = cls; return e; }

  function fit() {
    const s = Math.min(innerWidth / 1280, innerHeight / 720);
    stage.style.transform = `translate(-50%,-50%) scale(${s})`;
  }

  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    slides[cur].querySelectorAll('video').forEach(v => v.pause());
    cur = n;
    slides.forEach((s, k) => s.classList.toggle('active', k === n));
    parseVars(slides[n]).forEach(([k, v]) => stage.style.setProperty(k, v));
    stage.dataset.slide = n + 1;
    cnt.textContent = `${n + 1} / ${slides.length}`;
    prog.style.width = `${((n + 1) / slides.length) * 100}%`;
    const note = slides[n].querySelector('.notes');
    notebox.innerHTML = note ? note.innerHTML : '';
    history.replaceState(null, '', '#' + (n + 1));
    const v = slides[n].querySelector('video[autoplay]');
    if (v) v.play().catch(() => {});
  }

  function setAudio(on, silent) {
    if (!audio) return;
    if (on) audio.play().catch(() => {}); else if (!silent) audio.pause();
    aBtn.classList.toggle('on', on);
    aBtn.textContent = on ? '❚❚ Ovoz' : '▶ Ovoz';
  }
  function toggleNotes() {
    notebox.classList.toggle('show');
    bar.querySelector('[data-k=notes]').classList.toggle('on', notebox.classList.contains('show'));
  }
  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }

  bar.addEventListener('click', e => {
    const k = e.target.dataset && e.target.dataset.k;
    if (k === 'prev') go(cur - 1);
    if (k === 'next') go(cur + 1);
    if (k === 'audio') setAudio(audio.paused);
    if (k === 'notes') toggleNotes();
    if (k === 'full') toggleFull();
  });
  // interaktiv elementlar: kartani ochish, rejadan oʻtish, sanagich, video tanlash
  stage.addEventListener('click', e => {
    const t = e.target;
    const f = t.closest('.flip');
    if (f) { f.classList.toggle('open'); return; }
    const ra = t.closest('[data-revealall]');
    if (ra) {
      const cards = [...ra.closest('.slide').querySelectorAll('.flip')];
      const open = cards.some(c => !c.classList.contains('open'));
      cards.forEach(c => c.classList.toggle('open', open));
      ra.textContent = open ? 'Hammasini yopish' : 'Hammasini ochish';
      return;
    }
    const g = t.closest('[data-go]');
    if (g) { const k = slides.indexOf(document.getElementById(g.dataset.go)); if (k >= 0) go(k); return; }
    const d = t.closest('.ctr button');
    if (d) { const b = d.parentElement.querySelector('b'); b.textContent = Math.max(0, (+b.textContent || 0) + (+d.dataset.d)); return; }
  }, true);
  document.querySelectorAll('.vid').forEach(box => {
    const v = box.querySelector('video');
    const inp = box.querySelector('input[type=file]');
    v.addEventListener('loadedmetadata', () => box.classList.add('ok'));
    if (inp) inp.addEventListener('change', () => {
      if (inp.files[0]) { v.src = URL.createObjectURL(inp.files[0]); v.load(); }
    });
  });
  stage.addEventListener('click', e => {
    if (e.target.closest('video,a,button,label,input,.vid,.flip,[data-go],.ctr')) return;
    const r = stage.getBoundingClientRect();
    go(cur + ((e.clientX - r.left) / r.width < 0.2 ? -1 : 1));
  });
  addEventListener('keydown', e => {
    const k = e.key;
    if ((k === ' ' || k === 'Enter') && e.target.closest('button,a,video,label,input')) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
    else if (k === 'f' || k === 'F') toggleFull();
    else if (k === 'n' || k === 'N') toggleNotes();
    else if ((k === 'a' || k === 'A') && audio) setAudio(audio.paused);
  });
  let tx = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => {
    if (tx === null) return;
    const d = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(d) > 50) go(cur + (d < 0 ? 1 : -1));
  });
  let hideT;
  addEventListener('mousemove', () => {
    bar.classList.add('show'); clearTimeout(hideT);
    hideT = setTimeout(() => bar.classList.remove('show'), 2200);
  });
  addEventListener('hashchange', () => {
    const n = (parseInt(location.hash.slice(1), 10) || 1) - 1;
    if (n !== cur) go(n);
  });
  addEventListener('resize', fit);
  fit();
  go((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
