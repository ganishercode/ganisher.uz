/* ============================================
   G'anisher Raximov — Portfolio & Academic Hub
   Interactive JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ── Loader ──
  initLoader();
  // ── Particles ──
  initParticles();
  // ── Theme Toggle ──
  initThemeToggle();
  // ── Mobile Menu ──
  initMobileMenu();
  // ── Navbar Scroll ──
  initNavbarScroll();
  // ── Active Nav Link ──
  initActiveNavLink();
  // ── Scroll Reveal ──
  initScrollReveal();
  // ── Stat Counters ──
  initStatCounters();
  // ── Skill Bars ──
  initSkillBars();
  // ── Google Sheets Data ──
  initGoogleSheetsData();
});

/* ═══════════════════════════════════
   LOADER
   ═══════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('gloader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Trigger hero animations after loader hides
      document.body.style.overflow = '';
    }, 1800);
  });

  // Prevent scrolling while loader is visible
  document.body.style.overflow = 'hidden';

  // Fallback: hide loader after 4 seconds regardless
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 4000);
}

/* ═══════════════════════════════════
   PARTICLES BACKGROUND
   ═══════════════════════════════════ */
function initParticles() {
  const container = document.getElementById('particles-bg');
  if (!container) return;

  const colors = [
    'var(--accent-purple)',
    'var(--accent-teal)',
    'var(--accent-blue)',
  ];

  const particleCount = window.innerWidth < 768 ? 20 : 40;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 15;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      box-shadow: 0 0 ${size * 3}px ${color};
    `;

    container.appendChild(particle);
  }
}

/* ═══════════════════════════════════
   THEME TOGGLE (Dark / Light)
   ═══════════════════════════════════ */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!toggle || !icon) return;

  // Check saved preference
  const savedTheme = localStorage.getItem('gr-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  icon.innerHTML = savedTheme === 'dark' ? '<i class="ri-moon-fill"></i>' : '<i class="ri-sun-fill"></i>';

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('gr-theme', next);
    icon.innerHTML = next === 'dark' ? '<i class="ri-moon-fill"></i>' : '<i class="ri-sun-fill"></i>';

    // Smooth icon animation
    toggle.style.transform = 'rotate(360deg) scale(1.2)';
    setTimeout(() => {
      toggle.style.transform = '';
    }, 400);
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

  // Close menu when clicking a link
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ═══════════════════════════════════
   NAVBAR SCROLL EFFECT
   ═══════════════════════════════════ */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }, { passive: true });
}

/* ═══════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
   ═══════════════════════════════════ */
function initActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = [];

  navLinks.forEach(link => {
    const sectionId = link.getAttribute('data-section');
    const section = document.getElementById(sectionId);
    if (section) {
      sections.push({ el: section, link: link });
    }
  });

  if (sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const matchLink = sections.find(s => s.el === entry.target);
        if (matchLink) {
          matchLink.link.classList.add('active');
        }
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '-80px 0px -50% 0px'
  });

  sections.forEach(s => observer.observe(s.el));
}

/* ═══════════════════════════════════
   SCROLL REVEAL ANIMATIONS
   ═══════════════════════════════════ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════
   ANIMATED STAT COUNTERS
   ═══════════════════════════════════ */
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5
  });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2000;
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    const current = Math.floor(easedProgress * target);

    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

/* ═══════════════════════════════════
   SKILL BARS ANIMATION
   ═══════════════════════════════════ */
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill[data-width]');
  if (fills.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.getAttribute('data-width');
        entry.target.style.width = width + '%';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3
  });

  fills.forEach(fill => observer.observe(fill));
}

/* ═══════════════════════════════════
   SMOOTH SCROLL FOR ANCHOR LINKS
   ═══════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/* ═══════════════════════════════════
   GOOGLE SHEETS DATA FETCH (Gviz API)
   ═══════════════════════════════════ */
async function initGoogleSheetsData() {
    // MA'LUMOT: Bu yerga Google Sheet ID kiritiladi
    const sheetID = '1WE2WrRNR85G4zcBl09hUd9i7A2ZAdvYBgVnWiyuhlS0';

    // 1. Loyihalar (Portfolio) varag'ini o'qish (Varaq nomi "Loyihalar" bo'lishi kerak)
    try {
      const portfolioUrl = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=Loyihalar`;
      const res = await fetch(portfolioUrl);
      const text = await res.text();
      // JSON qismini ajratish (xavfsiz usul)
      const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const data = JSON.parse(jsonString);
      renderPortfolio(data.table);
    } catch (err) {
      console.error("Loyihalarni yuklashda xatolik:", err);
      document.getElementById('dynamic-portfolio').innerHTML = '<p style="text-align:center; width:100%; color:var(--accent-red);">Loyihalarni yuklashda xatolik yuz berdi. Jadval hammaga ochiqligini (Viewer) tekshiring.</p>';
    }

    // 2. Prezentatsiyalar varag'ini o'qish (Varaq nomi "Prezentatsiyalar" bo'lishi kerak)
    try {
      const presUrl = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=Prezentatsiyalar`;
      const res = await fetch(presUrl);
      const text = await res.text();
      // Xavfsiz JSON ajratish
      const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const data = JSON.parse(jsonString);
      renderPresentations(data.table);
    } catch (err) {
      console.error("Prezentatsiyalarni yuklashda xatolik:", err);
      document.getElementById('dynamic-presentations').innerHTML = '<p style="text-align:center; width:100%; color:var(--accent-red);">Prezentatsiyalarni yuklashda xatolik yuz berdi. Jadval hammaga ochiqligini (Viewer) tekshiring.</p>';
    }
  }

  function renderPortfolio(table) {
    const container = document.getElementById('dynamic-portfolio');
    container.innerHTML = '';

    if (!table.rows || table.rows.length === 0) {
      container.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Hozircha loyihalar mavjud emas.</p>';
      return;
    }

    table.rows.forEach((row, index) => {
      // Ustunlar tartibi [0]: Ikonka (masalan: ri-file-list-3-fill), [1]: Sarlavha, [2]: Matn, [3]: Teglar (vergul bilan)
      const icon = (row.c[0] && row.c[0].v) ? row.c[0].v : 'ri-file-list-3-fill';
      const title = (row.c[1] && row.c[1].v) ? row.c[1].v : 'Nomsiz loyiha';
      const desc = (row.c[2] && row.c[2].v) ? row.c[2].v : '';
      const tagsString = (row.c[3] && row.c[3].v) ? row.c[3].v : '';

      let tagsHtml = '';
      if (tagsString) {
        const tags = tagsString.split(',').map(t => t.trim());
        tagsHtml = tags.map(t => `<span>${t}</span>`).join('');
      }

      const delayClass = index > 0 ? `reveal-delay-${index > 3 ? 3 : index}` : '';

      const card = document.createElement('div');
      card.className = `glass-card portfolio-card reveal visible ${delayClass}`;
      card.innerHTML = `
      <span class="portfolio-card-icon"><i class="${icon}"></i></span>
      <h3>${title}</h3>
      <p>${desc}</p>
      <div class="portfolio-card-tags">
        ${tagsHtml}
      </div>
    `;
      container.appendChild(card);
    });
  }

  function renderPresentations(table) {
    const container = document.getElementById('dynamic-presentations');
    container.innerHTML = '';

    if (!table.rows || table.rows.length === 0) {
      container.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Hozircha prezentatsiyalar mavjud emas.</p>';
      return;
    }

    table.rows.forEach((row, index) => {
      // Ustunlar: [0]: Tur (Akademik/Tadqiqot), [1]: Ikonka, [2]: Sarlavha, [3]: Matn, [4]: Havola (Link)
      const type = (row.c[0] && row.c[0].v) ? row.c[0].v : 'Akademik';
      const badgeClass = type.toLowerCase() === 'tadqiqot' ? 'research' : 'academic';
      const icon = (row.c[1] && row.c[1].v) ? row.c[1].v : 'ri-book-read-fill';
      const title = (row.c[2] && row.c[2].v) ? row.c[2].v : 'Nomsiz prezentatsiya';
      const desc = (row.c[3] && row.c[3].v) ? row.c[3].v : '';
      const link = (row.c[4] && row.c[4].v) ? row.c[4].v : '#';

      const delayClass = index > 0 ? `reveal-delay-${index > 3 ? 3 : index}` : '';

      const card = document.createElement('div');
      card.className = `glass-card presentation-card reveal visible ${delayClass}`;
      card.innerHTML = `
      <span class="presentation-badge ${badgeClass}"><i class="${icon}"></i> ${type}</span>
      <h3>${title}</h3>
      <p>${desc}</p>
      <a href="${link}" target="_blank" rel="noopener noreferrer" class="btn btn-canva">
        <span class="btn-icon"><i class="ri-search-eye-line"></i></span>
        O'qish / Ochish
      </a>
    `;
      container.appendChild(card);
    });
  }
