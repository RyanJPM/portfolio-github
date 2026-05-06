/**
 * RYAN MARTIAL — PORTFOLIO (GitHub Pages, statique)
 * script.js — Interactions, animations — pas de formulaire / pas de collecte de données.
 */

/* ════════════════════════════════════════════════
   1. LOADER
════════════════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1500);
  });
})();


/* ════════════════════════════════════════════════
   2. CURSEUR PERSONNALISÉ (desktop uniquement)
════════════════════════════════════════════════ */
(function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  function animateRing() {
    const ease = 0.14;
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  const interactives = document.querySelectorAll('a, button, .skill-block, .project-item, .method-step');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* ════════════════════════════════════════════════
   3. NAVIGATION — scroll + burger
════════════════════════════════════════════════ */
(function initNav() {
  const header   = document.getElementById('header');
  const burger   = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));
})();


/* ════════════════════════════════════════════════
   4. ANIMATIONS AU SCROLL
════════════════════════════════════════════════ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.10 });

  elements.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════════
   5. SMOOTH SCROLL (ancres internes)
════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ════════════════════════════════════════════════
   6. PARALLAXE LÉGÈRE (orbes hero)
════════════════════════════════════════════════ */
(function initParallax() {
  const orbs = document.querySelectorAll('.orb');
  if (!orbs.length) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = [0.07, 0.04, 0.10][i] || 0.07;
        orb.style.transform = `translateY(${scrollY * speed}px)`;
      });
      ticking = false;
    });
  }, { passive: true });
})();


/* ════════════════════════════════════════════════
   7. TILT LÉGER (compétences, desktop)
════════════════════════════════════════════════ */
(function initSubtleTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cards = document.querySelectorAll('.skill-block');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = (e.clientX - cx) / (rect.width  / 2);
      const dy    = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateX(${dy * -2}deg) rotateY(${dx * 2}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
