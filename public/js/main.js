/* ─────────────────────────────────────────────────────────────
   Unigroup Transporters – main.js
   ───────────────────────────────────────────────────────────── */

// ─── NAV SCROLL ─────────────────────────────────────────────
(function () {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

// ─── MOBILE MENU ────────────────────────────────────────────
(function () {
  const burger = document.querySelector('.nav-burger');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
})();

// ─── SMOOTH ANCHOR SCROLL ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── SCROLL REVEAL ──────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('.reveal, .stat-item');
  const io  = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  els.forEach(el => io.observe(el));
})();

// ─── ANIMATED COUNTERS ──────────────────────────────────────
(function () {
  const stats = document.querySelectorAll('.stat-num[data-target]');
  let animated = false;

  function animate() {
    if (animated) return;
    animated = true;
    stats.forEach(stat => {
      const target = parseInt(stat.dataset.target, 10);
      const span   = stat.querySelector('.count');
      if (!span) return;
      let start = 0;
      const duration = 1800;
      const step = timestamp => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        span.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(step);
        else span.textContent = target;
      };
      requestAnimationFrame(step);
    });
  }

  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) animate(); }),
    { threshold: 0.3 }
  );
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) io.observe(statsSection);
})();

// ─── CONTACT FORM ───────────────────────────────────────────
(function () {
  const form   = document.getElementById('contactForm');
  const btn    = document.getElementById('formSubmit');
  const status = document.getElementById('formStatus');
  if (!form) return;

  // Field-level validation helpers
  function setError(input, msg) {
    input.classList.toggle('error', !!msg);
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = msg || '';
  }

  function validateEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  // Live validation on blur
  form.querySelectorAll('[required]').forEach(input => {
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        setError(input, 'This field is required.');
      } else if (input.type === 'email' && !validateEmail(input.value.trim())) {
        setError(input, 'Please enter a valid email.');
      } else {
        setError(input, '');
      }
    });
    input.addEventListener('input', () => {
      if (input.value.trim()) setError(input, '');
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all required fields
    let valid = true;
    form.querySelectorAll('[required]').forEach(input => {
      if (!input.value.trim()) {
        setError(input, 'This field is required.');
        valid = false;
      } else if (input.type === 'email' && !validateEmail(input.value.trim())) {
        setError(input, 'Please enter a valid email.');
        valid = false;
      }
    });
    if (!valid) return;

    // Collect data
    const body = {
      name:    form.name.value.trim(),
      company: form.company.value.trim(),
      phone:   form.phone.value.trim(),
      email:   form.email.value.trim(),
      service: form.service.value,
      message: form.message.value.trim(),
    };

    // Loading state
    btn.disabled = true;
    btn.classList.add('loading');
    status.textContent = '';
    status.className   = 'form-status';

    try {
      const res  = await fetch('/api/enquiry', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (data.ok) {
        status.textContent = '✓ Message sent! We\'ll get back to you within 24 hours.';
        status.classList.add('success');
        form.reset();
      } else {
        const msg = data.errors ? data.errors.join(' ') : 'Something went wrong. Please try again.';
        status.textContent = msg;
        status.classList.add('error');
      }
    } catch {
      status.textContent = 'Network error. Please check your connection and try again.';
      status.classList.add('error');
    } finally {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  });
})();

// ─── FOOTER YEAR ────────────────────────────────────────────
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();
