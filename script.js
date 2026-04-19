/* ============================================
   G'anisher Raximov — Portfolio & Academic Hub
   Interactive JavaScript (Clean Edition)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initParticles();
  initThemeToggle();
  initMobileMenu();
  initNavbarScroll();
  initActiveNavLink();
  initScrollReveal();
  initStatCounters();
  initSkillBars();
  initGoogleSheetsData();
  initMouseGlow();
  initTypewriter();
  initHoverTilt();
  initStatCardsInteractions();
  initPortfolioFilters();
  initNavbarClock();
  initCustomCursor();
});

/* ═══════════════════════════════════
   LOADER
   ═══════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('gloader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => { loader.classList.add('hidden'); document.body.style.overflow = ''; }, 1800);
  });
  document.body.style.overflow = 'hidden';
  setTimeout(() => { loader.classList.add('hidden'); document.body.style.overflow = ''; }, 4000);
}

/* ═══════════════════════════════════
   PARTICLES BACKGROUND (SVG)
   ═══════════════════════════════════ */
function initParticles() {
  const container = document.getElementById('particles-bg');
  if (!container) return;
  const colors = ['var(--accent-purple)', 'var(--accent-teal)', 'var(--accent-blue)'];
  const svgs = [
    '<svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>', // yulduz
    '<svg viewBox="0 0 24 24"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"/></svg>', // plus
    '<svg viewBox="0 0 24 24"><path d="M2.859 2.477l12.57-2.719c.883-.191 1.764.471 1.764 1.39v21.7q0 .907-1.748 1.378l-12.57-2.71a1.2 1.2 0 0 1-.954-1.173v-16.7a1.21 1.21 0 0 1 .938-1.166zm16.334 2.223h2.6c.66 0 1.2.537 1.2 1.2v12.2c0 .663-.54 1.2-1.2 1.2h-2.6v-14.6z"/></svg>' // excel
  ];
  const count = window.innerWidth < 768 ? 10 : 25;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const svgIcon = svgs[Math.floor(Math.random() * svgs.length)];
    p.style.cssText = `left:${Math.random()*100}%; color:${color}; animation-duration:${Math.random()*20+15}s; animation-delay:-${Math.random()*15}s;`;
    p.innerHTML = svgIcon;
    // Tasodifiy razmer
    const svgEl = p.querySelector('svg');
    const size = Math.random() * 14 + 10;
    if(svgEl) { svgEl.style.width = size+'px'; svgEl.style.height = size+'px'; }
    container.appendChild(p);
  }
}

/* ═══════════════════════════════════
   MOUSE GLOW
   ═══════════════════════════════════ */
function initMouseGlow() {
  const glow = document.getElementById('mouse-glow');
  if (!glow || window.innerWidth < 768) return; // mobilda o'chirib qoyamiz
  document.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    glow.style.top = e.clientY + 'px';
    glow.style.left = e.clientX + 'px';
  });
  document.addEventListener('mouseleave', () => glow.style.opacity = '0');
}

/* ═══════════════════════════════════
   DYNAMIC TYPEWRITER
   ═══════════════════════════════════ */
function initTypewriter() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const words = ["Excelda tizim yaratishga", "AI ni ishga joriy qilishga", "No-code ilovalar tuzishga"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }
    el.textContent = currentWord.substring(0, charIndex);
    
    let typeSpeed = isDeleting ? 40 : 80;
    if (!isDeleting && charIndex === currentWord.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500;
    }
    setTimeout(type, typeSpeed);
  }
  type();
}

/* ═══════════════════════════════════
   HOVER TILT EFFECT
   ═══════════════════════════════════ */
function initHoverTilt() {
  const wrapper = document.getElementById('tilt-wrapper');
  if(!wrapper || window.innerWidth < 768) return;
  
  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt degrees (max 15 deg)
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    wrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  
  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
}

/* ═══════════════════════════════════
   THEME TOGGLE
   ═══════════════════════════════════ */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!toggle || !icon) return;
  const saved = localStorage.getItem('gr-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  icon.innerHTML = saved === 'dark' ? '<i class="ri-moon-fill"></i>' : '<i class="ri-sun-fill"></i>';
  toggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('gr-theme', next);
    icon.innerHTML = next === 'dark' ? '<i class="ri-moon-fill"></i>' : '<i class="ri-sun-fill"></i>';
    toggle.style.transform = 'rotate(360deg) scale(1.2)';
    setTimeout(() => { toggle.style.transform = ''; }, 400);
  });
}

/* ═══════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════ */
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const menu = document.getElementById('navMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open'); menu.classList.remove('open'); document.body.style.overflow = '';
    });
  });
}

/* ═══════════════════════════════════
   NAVBAR SCROLL
   ═══════════════════════════════════ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ═══════════════════════════════════
   ACTIVE NAV LINK
   ═══════════════════════════════════ */
function initActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = [];
  navLinks.forEach(link => {
    const s = document.getElementById(link.getAttribute('data-section'));
    if (s) sections.push({ el: s, link });
  });
  if (!sections.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const m = sections.find(s => s.el === entry.target);
        if (m) m.link.classList.add('active');
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });
  sections.forEach(s => obs.observe(s.el));
}

/* ═══════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════
   STAT COUNTERS
   ═══════════════════════════════════ */
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000, start = performance.now();
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function update(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(ease(p) * target) + suffix;
    if (p < 1) requestAnimationFrame(update); else el.textContent = target + suffix;
  }
  requestAnimationFrame(update);
}

/* ═══════════════════════════════════
   PREMIUM STAT CARD INTERACTIONS
   ═══════════════════════════════════ */
function initStatCardsInteractions() {
  const cards = document.querySelectorAll('.stat-card, .neon-chart-wrapper');
  if (!cards.length || window.innerWidth < 768) return;
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Spotlight update
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      
      // Tilt logic
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transition = 'none';
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s ease-out';
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      setTimeout(() => { if(card) card.style.transition = ''; }, 400);
    });
  });
}

/* ═══════════════════════════════════
   SKILL BARS
   ═══════════════════════════════════ */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill[data-width]');
  if (!fills.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.width = e.target.getAttribute('data-width') + '%'; obs.unobserve(e.target); } });
  }, { threshold: 0.3 });
  fills.forEach(f => obs.observe(f));
}

/* ═══════════════════════════════════
   SMOOTH SCROLL
   ═══════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    e.preventDefault();
    const t = document.querySelector(this.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ═══════════════════════════════════
   PORTFOLIO FILTERS (V2)
   ═══════════════════════════════════ */
function initPortfolioFilters() {
  const filters = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card-v2');
  if (!filters.length || !cards.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      cards.forEach(card => {
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'scale(0.8)';
        card.style.opacity = '0';
        
        setTimeout(() => {
          if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
            card.classList.remove('hidden');
            setTimeout(() => {
              card.style.transform = 'scale(1)';
              card.style.opacity = '1';
            }, 50);
          } else {
            card.classList.add('hidden');
          }
        }, 300);
      });
    });
  });
}

/* ═══════════════════════════════════
   GOOGLE SHEETS DATA
   ═══════════════════════════════════ */
async function initGoogleSheetsData() {
  const sheetID = '1WE2WrRNR85G4zcBl09hUd9i7A2ZAdvYBgVnWiyuhlS0';
  
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=Prezentatsiyalar`);
    const text = await res.text();
    const data = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    renderPresentations(data.table);
  } catch (e) {
    console.error("Prezentatsiyalar xatolik:", e);
    const container = document.getElementById('dynamic-presentations');
    if (container) container.innerHTML = '<p style="text-align:center;width:100%;color:#ef4444;">Prezentatsiyalarni yuklashda xatolik.</p>';
  }
}

function renderPresentations(table) {
  const c = document.getElementById('dynamic-presentations');
  c.innerHTML = '';
  if (!table.rows || !table.rows.length) { c.innerHTML = '<p style="text-align:center;width:100%;color:var(--text-secondary);">Hozircha prezentatsiyalar mavjud emas.</p>'; return; }
  table.rows.forEach((row, i) => {
    if (!row || !row.c) return;
    const type = (row.c[0]&&row.c[0].v)||'Akademik', bc = type.toLowerCase()==='tadqiqot'?'research':'academic';
    const icon = (row.c[1]&&row.c[1].v)||'ri-book-read-fill', title = (row.c[2]&&row.c[2].v)||'Nomsiz', desc = (row.c[3]&&row.c[3].v)||'', link = (row.c[4]&&row.c[4].v)||'#';
    const card = document.createElement('div');
    card.className = `glass-card presentation-card reveal visible ${i>0?`reveal-delay-${Math.min(i,3)}`:''}`;
    card.innerHTML = `<span class="presentation-badge ${bc}"><i class="${icon}"></i> ${type}</span><h3>${title}</h3><p>${desc}</p><a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn-canva"><span class="btn-icon"><i class="ri-search-eye-line"></i></span> O'qish / Ochish</a>`;
    c.appendChild(card);
  });
}

/* ═══════════════════════════════════
   NAVBAR CLOCK
   ═══════════════════════════════════ */
function initNavbarClock() {
  const clockEl = document.getElementById('navClock');
  if (!clockEl) return;

  const monthsUz = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

  function updateClock() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = monthsUz[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockEl.innerHTML = `
      <span class="clock-date">${day} ${month} ${year}, </span>
      <span class="clock-time">${hours}:${minutes}<span class="clock-seconds">:${seconds}</span></span>
    `;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ═══════════════════════════════════
   CUSTOM CURSOR
   ═══════════════════════════════════ */
function initCustomCursor() {
  const star = document.querySelector('.cursor-star');
  const ring = document.querySelector('.cursor-ring');
  if (!star || !ring) return;

  // We only run custom cursor logic on non-touch devices
  if (window.matchMedia("(pointer: coarse)").matches) {
    document.getElementById('custom-cursor').style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const lerp = (a, b, n) => (1 - n) * a + n * b;

  function render() {
    ringX = lerp(ringX, mouseX, 0.15);
    ringY = lerp(ringY, mouseY, 0.15);

    star.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  const interactives = document.querySelectorAll('a, button, .glass-card, .portfolio-card-v2, .stat-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('hovered');
      star.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('hovered');
      star.classList.remove('hovered');
    });
  });
}
