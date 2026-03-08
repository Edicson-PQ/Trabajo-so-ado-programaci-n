'use strict';

/* ═══════════════════════════════════════════════════
   0. DARK / LIGHT MODE TOGGLE
═══════════════════════════════════════════════════ */
(function () {
  const html = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Recuperar preferencia guardada o usar la del sistema
  const saved = localStorage.getItem('theme');
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  let current = saved || system;

  const apply = (theme) => {
    html.setAttribute('data-theme', theme);
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    localStorage.setItem('theme', theme);
    current = theme;
  };

  apply(current); // aplicar al cargar

  btn.addEventListener('click', () => apply(current === 'dark' ? 'light' : 'dark'));
})();

/* ═══════════════════════════════════════════════════
   0b. CURSOR SPOTLIGHT
═══════════════════════════════════════════════════ */
(function () {
  const spotlight = document.getElementById('spotlight');
  if (!spotlight) return;

  window.addEventListener('mousemove', e => {
    spotlight.style.setProperty('--x', `${e.clientX}px`);
    spotlight.style.setProperty('--y', `${e.clientY}px`);
  }, { passive: true });
})();


(function () {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════
   2. SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════════════════════ */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const delay = +(target.dataset.srDelay || 0);
      setTimeout(() => target.classList.add('sr-visible'), delay);
      io.unobserve(target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Elementos individuales
  [
    '#about .copy',
    '#about .info-list',
    '#skills .container > div:first-child',
    '#projects .container > div:first-child',
    '#services .container > div:first-child',
    '#contact .container > div:first-child',
    '.stats-row',
  ].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.classList.add('sr-hidden'); io.observe(el); }
  });

  // Grupos con stagger
  [
    { sel: '.info-card', step: 80 },
    { sel: '.project-card', step: 120 },
    { sel: '.service-card', step: 120 },
    { sel: '.contact-panel', step: 100 },
  ].forEach(({ sel, step }) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('sr-hidden');
      el.dataset.srDelay = i * step;
      io.observe(el);
    });
  });
})();

/* ═══════════════════════════════════════════════════
   3. TYPEWRITER — texto accent del h1
═══════════════════════════════════════════════════ */
(function () {
  const accentEl = document.querySelector('.hero h1 .accent');
  if (!accentEl) return;
  const fullText = accentEl.textContent.trim();
  accentEl.textContent = '';
  accentEl.setAttribute('aria-label', fullText);
  accentEl.classList.add('typing');

  let i = 0;
  const type = () => {
    if (i <= fullText.length) {
      accentEl.textContent = fullText.slice(0, i++);
      setTimeout(type, i <= fullText.length ? 68 : 1200);
    } else {
      accentEl.classList.remove('typing'); // activa gradiente
    }
  };
  setTimeout(type, 900);
})();

/* ═══════════════════════════════════════════════════
   4. CONTADORES — animación de números
═══════════════════════════════════════════════════ */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const end = +target.dataset.count;
      const suf = target.dataset.suffix || '';
      const dur = 1600;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        target.textContent = Math.round((1 - (1 - p) ** 3) * end) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
})();

/* ═══════════════════════════════════════════════════
   5. TILT 3D — project & service cards
═══════════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('.project-card, .service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px) scale(1.02)`;
      card.style.transition = 'transform 60ms linear';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 500ms ease, box-shadow 220ms ease';
    });
  });
})();

/* ═══════════════════════════════════════════════════
   6. RIPPLE — botones
═══════════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const rip = document.createElement('span');
      rip.className = 'btn-ripple';
      rip.style.left = (e.clientX - r.left) + 'px';
      rip.style.top = (e.clientY - r.top) + 'px';
      btn.appendChild(rip);
      rip.addEventListener('animationend', () => rip.remove(), { once: true });
    });
  });
})();

/* ═══════════════════════════════════════════════════
   7. PARTÍCULAS — canvas en el hero
═══════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts, N;

  const mkPts = () => Array.from({ length: N }, () => {
    const isLarge = Math.random() > 0.85; // 15% de partículas grandes
    // Tamaño dinámico (puntos grandes resaltan mucho)
    const baseR = isLarge ? (Math.random() * 3 + 2.5) : (Math.random() * 1.5 + 0.6);
    // Opacidad dependiendo del tamaño
    const baseA = isLarge ? (Math.random() * 0.4 + 0.2) : (Math.random() * 0.3 + 0.05);

    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: baseR,
      a: baseA,
    };
  });

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;

    N = Math.floor((W * H) / 14000);
    N = Math.min(Math.max(N, 40), 150);

    pts = mkPts();
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });

  const frame = () => {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(37,99,235,${p.a})`;
      ctx.fill();
    });

    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 160) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(37,99,235,${0.25 * (1 - d / 160)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  };
  frame();
})();

/* ═══════════════════════════════════════════════════
   8. METRO MAP — staggard appearance
═══════════════════════════════════════════════════ */
(function () {
  const mapSection = document.querySelector('.metro-section');
  if (!mapSection) return;
  const lines = mapSection.querySelectorAll('.metro-line');

  const updateMetroScroll = () => {
    const rect = mapSection.getBoundingClientRect();
    const windowH = window.innerHeight;

    // El punto donde empieza a dibujarse: cuando la sección entra al 85% de la pantalla
    const startY = rect.top - (windowH * 0.85);
    // Margen de recorrido en píxeles. 
    const scrollPathPixels = windowH * 0.6;

    let progress = 0;
    if (startY < 0) {
      progress = Math.min(100, Math.max(0, (-startY / scrollPathPixels) * 100));
    }

    lines.forEach(line => {
      const railProgress = line.querySelector('.line-rail-progress');
      if (railProgress) {
        if (window.innerWidth <= 900) {
          railProgress.style.height = progress + '%';
          railProgress.style.width = '100%';
        } else {
          railProgress.style.width = progress + '%';
          railProgress.style.height = '100%';
        }
      }

      const stations = line.querySelectorAll('.station');
      stations.forEach((st, idx) => {
        // threshold de aparición para cada estación 
        const threshold = (idx / Math.max(1, (stations.length - 1))) * 90; // El 90% para que la última estación se encienda un poquito antes del 100% de la barra

        if (progress >= threshold) {
          st.classList.add('active');
        } else {
          st.classList.remove('active');
        }
      });
    });
  }

  window.addEventListener('scroll', updateMetroScroll, { passive: true });
  window.addEventListener('resize', updateMetroScroll, { passive: true });
  updateMetroScroll(); // trigger visual on load
})();
