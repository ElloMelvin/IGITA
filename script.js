document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // NAVBAR + STATUS BAR SCROLL (FIX #1)
  // Status bar collapses; nav slides from top:32px → top:0
  // ============================================================
  const navbar    = document.getElementById('navbar');
  const statusBar = document.querySelector('.status-bar');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Collapse status bar after user scrolls past its height
    if (statusBar) statusBar.classList.toggle('collapsed', y > 40);

    // Nav slides up once status bar is gone; also shrink padding
    navbar.classList.toggle('scrolled', y > 60);
  }, { passive: true });

  // ============================================================
  // HAMBURGER / MOBILE NAV (FIX #2)
  // ============================================================
  const burger    = document.getElementById('nav-burger');
  const mobileNav = document.getElementById('mobile-nav');

  function openMenu() {
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Tutup menu navigasi');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // prevent background scroll
    // Focus first link for keyboard users
    const firstLink = mobileNav.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Buka menu navigasi');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    burger.focus(); // return focus to trigger
  }

  burger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when any mobile nav link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
  });

  // Close when clicking outside the nav (on overlay area)
  mobileNav.addEventListener('click', e => {
    if (e.target === mobileNav) closeMenu();
  });

  // ============================================================
  // COUNTDOWN (Target: 11 Agustus 2026 08:00 WIB = UTC+7)
  // ============================================================
  const IDS = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'];

  function updateCountdown() {
    // 08:00 WIB = 01:00 UTC
    const deadline = new Date('2026-08-11T01:00:00Z');
    const diff     = deadline - Date.now();

    if (diff <= 0) {
      IDS.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '00'; });
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    const vals = [d, h, m, s];
    IDS.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(vals[i]).padStart(2, '0');
    });
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ============================================================
  // TIMELINE AUTO-STATUS
  // ============================================================
  function updateTimelineStatus() {
    const now = Date.now();
    document.querySelectorAll('.tl-item').forEach(item => {
      const startStr = item.getAttribute('data-start');
      const endStr   = item.getAttribute('data-end');
      if (!startStr || !endStr) return;

      const start = new Date(startStr).getTime();
      const end   = new Date(endStr);
      end.setHours(23, 59, 59, 999);

      const statusEl = item.querySelector('.tl-status');
      if (!statusEl) return;

      if (now >= start && now <= end.getTime()) {
        item.classList.add('active');
        statusEl.classList.add('open');
      } else if (now > end.getTime()) {
        statusEl.classList.add('closed');
      } else {
        statusEl.classList.add('upcoming');
      }
    });
  }
  updateTimelineStatus();

  // ============================================================
  // SCROLL REVEAL
  // ============================================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // NOTE: Child stagger animation is now handled entirely by CSS
  // (FIX #6: removed the JS stagger that set inline opacity/transform
  //  directly on children, which conflicted with the parent reveal).

  // ============================================================
  // PARTICLE CANVAS
  // ============================================================
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    const mouse  = { x: null, y: null, radius: 140 };
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const count  = mobile ? 20 : 45;
    const colors = ['rgba(0,230,118,0.35)', 'rgba(0,188,212,0.25)', 'rgba(232,245,233,0.18)'];

    function resize() {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
    resize();

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    class Particle {
      constructor() {
        this.x     = Math.random() * width;
        this.y     = Math.random() * height;
        this.vx    = (Math.random() - 0.5) * 0.3;
        this.vy    = (Math.random() - 0.5) * 0.3;
        this.size  = Math.random() * 1.8 + 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = width;
        if (this.x > width)  this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        if (mouse.x !== null) {
          const dx   = mouse.x - this.x;
          const dy   = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 1.8;
            this.y -= Math.sin(angle) * force * 1.8;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    function init() { particles = []; for (let i = 0; i < count; i++) particles.push(new Particle()); }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!prefersReduced.matches) {
      init(); animate();
    } else {
      init(); particles.forEach(p => p.draw());
    }
  }

  initParticles();
});