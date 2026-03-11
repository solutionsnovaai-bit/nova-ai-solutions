// ══════════════════════════════════════════════
// NOVA AI — main.js  (enhanced)
// ══════════════════════════════════════════════

// ── NEURAL NETWORK STARS CANVAS ──
const canvas = document.getElementById('stars-canvas');
const ctx    = canvas.getContext('2d');

let stars      = [];
let mouse      = { x: -9999, y: -9999 };
let isMobile   = window.innerWidth < 768;
const STAR_COUNT = isMobile ? 80 : 180;
const CONNECT_DIST = isMobile ? 0 : 130;   // no lines on mobile (perf)
const MOUSE_REPEL  = 90;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  isMobile      = window.innerWidth < 768;
}

function createStars() {
  stars = [];
  const count = isMobile ? 80 : 180;
  for (let i = 0; i < count; i++) {
    stars.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.12,
      vy:    (Math.random() - 0.5) * 0.12,
      r:     Math.random() * 1.8 + 0.3,
      baseR: 0,
      o:     Math.random() * 0.7 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.0004 + Math.random() * 0.0006,
      color: Math.random() > 0.85 ? '#C9A84C'
           : Math.random() > 0.70 ? '#00FF88'
           : '#C8E6FF',
    });
    stars[stars.length - 1].baseR = stars[stars.length - 1].r;
  }
}

function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // move stars
  stars.forEach(s => {
    s.x += s.vx;
    s.y += s.vy;
    if (s.x < 0) s.x = canvas.width;
    if (s.x > canvas.width)  s.x = 0;
    if (s.y < 0) s.y = canvas.height;
    if (s.y > canvas.height) s.y = 0;
  });

  // draw connection lines (desktop only)
  if (!isMobile) {
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx   = stars[i].x - stars[j].x;
        const dy   = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.18;
          // gold lines near mouse, green elsewhere
          const mx  = (stars[i].x + stars[j].x) / 2;
          const my  = (stars[i].y + stars[j].y) / 2;
          const md  = Math.hypot(mx - mouse.x, my - mouse.y);
          const col = md < 200 ? `rgba(201,168,76,${alpha * 2.5})`
                               : `rgba(0,200,136,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = col;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  // draw stars
  stars.forEach(s => {
    const twinkle = s.o * (0.45 + 0.55 * Math.sin(t * s.speed * 1000 + s.phase));
    // mouse proximity glow
    const md   = Math.hypot(s.x - mouse.x, s.y - mouse.y);
    const glow = md < MOUSE_REPEL ? (1 - md / MOUSE_REPEL) : 0;
    const r    = s.baseR + glow * 2.5;

    const [rv, gv, bv] = s.color === '#C9A84C' ? [201, 168,  76]
                       : s.color === '#00FF88' ? [  0, 255, 136]
                       :                         [200, 230, 255];

    if (glow > 0.1) {
      const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 6);
      grad.addColorStop(0, `rgba(${rv},${gv},${bv},${twinkle * 0.6})`);
      grad.addColorStop(1, `rgba(${rv},${gv},${bv},0)`);
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rv},${gv},${bv},${twinkle})`;
    ctx.fill();
  });

  requestAnimationFrame(drawStars);
}

resizeCanvas();
createStars();
window.addEventListener('resize', () => { resizeCanvas(); createStars(); });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
requestAnimationFrame(drawStars);

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});


// ── MOBILE MENU ──
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
document.querySelectorAll('.mob-link, .mob-cta').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('active');
    document.body.style.overflow = '';
  });
});


// ── SPRING PHYSICS ENGINE ──
// Each observed element gets spring-based entrance
class Spring {
  constructor(el, opts = {}) {
    this.el      = el;
    this.stiff   = opts.stiffness  || 180;
    this.damp    = opts.damping    || 18;
    this.mass    = opts.mass       || 1;
    this.y       = opts.fromY      || 60;
    this.vy      = 0;
    this.alpha   = 0;
    this.valpha  = 0;
    this.scale   = opts.fromScale  || 0.92;
    this.vscale  = 0;
    this.running = false;
    this.delay   = opts.delay      || 0;
  }

  start() {
    setTimeout(() => {
      this.running = true;
      this._tick();
    }, this.delay);
  }

  _tick() {
    if (!this.running) return;

    // spring toward target (y=0, alpha=1, scale=1)
    const ay = (-this.stiff * this.y - this.damp * this.vy) / this.mass;
    this.vy += ay * 0.016;
    this.y  += this.vy * 0.016;

    const aa = (-this.stiff * (this.alpha - 1) - this.damp * this.valpha) / this.mass;
    this.valpha += aa * 0.016;
    this.alpha  += this.valpha * 0.016;

    const as2 = (-this.stiff * (this.scale - 1) - this.damp * this.vscale) / this.mass;
    this.vscale += as2 * 0.016;
    this.scale  += this.vscale * 0.016;

    this.el.style.transform = `translateY(${this.y.toFixed(2)}px) scale(${this.scale.toFixed(4)})`;
    this.el.style.opacity   = Math.min(1, Math.max(0, this.alpha)).toFixed(4);

    const settled =
      Math.abs(this.y) < 0.15 && Math.abs(this.vy) < 0.15 &&
      Math.abs(1 - this.alpha) < 0.005 && Math.abs(1 - this.scale) < 0.001;

    if (!settled) {
      requestAnimationFrame(() => this._tick());
    } else {
      this.el.style.transform = 'translateY(0) scale(1)';
      this.el.style.opacity   = '1';
    }
  }
}

// Intersection observer that triggers spring on each .reveal element
const springObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // reset
    el.style.opacity   = '0';
    el.style.transform = 'translateY(60px) scale(0.92)';

    const delay = (el.dataset.springDelay ? +el.dataset.springDelay : idx * 90);
    const sp = new Spring(el, {
      stiffness: 160,
      damping:   16,
      fromY:     60,
      fromScale: 0.93,
      delay,
    });
    sp.start();
    springObserver.unobserve(el);
  });
}, { threshold: 0.06 });

document.querySelectorAll('.reveal').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(60px) scale(0.92)';
  springObserver.observe(el);
});

// hero elements use CSS animation (already visible on load)
document.querySelectorAll('.reveal-fast').forEach(el => {
  el.classList.add('visible');
});


// ── 3D TILT ON CARDS (desktop) ──
if (!isMobile) {
  document.querySelectorAll('.sol-card, .pq-item, .cta-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = (e.clientX - r.left) / r.width  - 0.5;
      const y   = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
      setTimeout(() => card.style.transition = '', 500);
    });
  });
}


// ── NICHO TABS ──
const tabBtns    = document.querySelectorAll('.tab-btn');
const nichoPanels = document.querySelectorAll('.nicho-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    nichoPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === `tab-${target}`) panel.classList.add('active');
    });
  });
});


// ── COUNTER ANIMATION ──
function animateCounter(el) {
  const target   = parseInt(el.dataset.target);
  const suffix   = el.dataset.suffix || '';
  let start      = null;
  const duration = 1800;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.hnum[data-target]').forEach(el => counterObserver.observe(el));


// ── SMOOTH ANCHOR SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});


// ── ACTIVE NAV LINK ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav ul a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));


// ── SCROLL PROGRESS BAR ──
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${(scrolled / total) * 100}%`;
  });
}


// ── MOBILE: swipe tabs ──
let touchStartX = 0;
const tabsContainer = document.querySelector('.nichos-tabs');

document.querySelector('.nicho-panels')?.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.querySelector('.nicho-panels')?.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) < 50) return;

  const btns   = [...tabBtns];
  const active = btns.findIndex(b => b.classList.contains('active'));
  const next   = diff > 0
    ? Math.min(active + 1, btns.length - 1)
    : Math.max(active - 1, 0);

  if (next !== active) btns[next].click();
}, { passive: true });
