/**
 * RYAN MARTIAL — Portfolio v3 (loader, hero EN, stats, avatar pixel, toast)
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ═══ Son clavier (Web Audio, après unlock utilisateur) ═══ */
let audioCtx = null;
let soundEnabled = false;

async function unlockAudio() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
    soundEnabled = audioCtx.state === "running";
  } catch {
    soundEnabled = false;
  }
}

function keyTick() {
  if (!soundEnabled || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "square";
  o.frequency.value = 880 + Math.random() * 120;
  g.gain.value = 0.01;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + 0.025);
}

function enterChime() {
  if (!soundEnabled || !audioCtx) return;
  [523.25, 659.25, 783.99].forEach((freq, i) => {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.06, audioCtx.currentTime + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.05 + 0.2);
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start(audioCtx.currentTime + i * 0.05);
    o.stop(audioCtx.currentTime + i * 0.05 + 0.22);
  });
}

/* ═══ Loader barre recherche ═══ */
(function initLoaderSearch() {
  const loader = document.getElementById("loader");
  const out = document.getElementById("loaderTyped");
  const enterRow = document.getElementById("loaderEnterRow");
  const enterBtn = document.getElementById("loaderEnterBtn");
  if (!loader || !out || !enterRow) return;

  const FULL_NAME = "Ryan Martial";

  async function typeString(str) {
    out.textContent = "";
    for (let i = 0; i <= str.length; i++) {
      out.textContent = str.slice(0, i);
      if (i > 0) keyTick();
      await sleep(48 + Math.random() * 35);
    }
  }

  async function runTypingDemo() {
    await sleep(1000);
    await unlockAudio();
    await typeString(FULL_NAME);
    enterRow.classList.add("is-visible");
  }

  async function finishLoader() {
    await unlockAudio();
    enterChime();
    loader.classList.add("hidden");
    loader.setAttribute("aria-hidden", "true");
    document.dispatchEvent(new CustomEvent("portfolio:loaderDone"));
    setTimeout(() => {
      loader.style.display = "none";
    }, 700);
  }

  /* Premier geste sur l’écran de chargement : débloque l’audio si le navigateur l’exige */
  loader.addEventListener("pointerdown", () => {
    void unlockAudio();
  });

  enterBtn?.addEventListener("click", () => {
    void finishLoader();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (loader.classList.contains("hidden")) return;
    if (!enterRow.classList.contains("is-visible")) return;
    e.preventDefault();
    void finishLoader();
  });

  void runTypingDemo();
})();

/* ═══ Hero typewriter (EN) ═══ */
(function initHeroTypewriter() {
  const el = document.getElementById("heroTyped");
  if (!el) return;

  const roles = [
    { text: "a web developer", spectacle: false },
    { text: "a digital project maker", spectacle: false },
    { text: "AI-powered", spectacle: false },
    { text: "The one you need", spectacle: true },
  ];

  let idx = 0;
  let running = false;

  async function typeWord(str, spectacle) {
    el.textContent = "";
    el.className = "hero-typed" + (spectacle ? " hero-typed--spectacle" : "");
    for (let i = 0; i <= str.length; i++) {
      el.textContent = str.slice(0, i);
      await sleep(42);
    }
  }

  async function deleteWord(str) {
    for (let i = str.length; i >= 0; i--) {
      el.textContent = str.slice(0, i);
      await sleep(22);
    }
  }

  async function loop() {
    running = true;
    while (running) {
      const { text, spectacle } = roles[idx];
      await typeWord(text, spectacle);
      await sleep(spectacle ? 2200 : 1600);
      await deleteWord(text);
      await sleep(400);
      idx = (idx + 1) % roles.length;
    }
  }

  document.addEventListener("portfolio:loaderDone", () => {
    setTimeout(() => loop(), 400);
  });
})();

/* ═══ Stats compétences — remplir les barres au scroll ═══ */
(function initSkillStatBars() {
  const rows = document.querySelectorAll(".skill-stat-row");
  if (!rows.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        obs.unobserve(en.target);
      });
    },
    { threshold: 0.2 }
  );

  rows.forEach((r) => obs.observe(r));
})();



/* ═══ Toast 60 s après entrée sur le site (loader terminé) ═══ */
(function initDwellToast() {
  const toast = document.getElementById("dwellToast");
  const close = document.getElementById("dwellToastClose");
  if (!toast) return;

  let fired = false;
  let timerId = null;

  function openToast() {
    if (fired) return;
    fired = true;
    toast.removeAttribute("hidden");
    requestAnimationFrame(() => toast.classList.add("is-open"));
  }

  close?.addEventListener("click", () => {
    toast.classList.remove("is-open");
    setTimeout(() => {
      toast.setAttribute("hidden", "");
    }, 500);
  });

  function armAfterLoader() {
    if (timerId !== null || fired) return;
    timerId = window.setTimeout(() => {
      if (!document.hidden) openToast();
    }, 60000);
  }

  document.addEventListener("portfolio:loaderDone", armAfterLoader, { once: true });
})();

/* ═══ Loader terminé : lancer le hero si loader déjà absent (refresh) ═══ */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader?.classList.contains("hidden")) {
    document.dispatchEvent(new CustomEvent("portfolio:loaderDone"));
  }
});

/* ═══ LOADER : ne plus auto-hide au load — géré par Entrée ═══ */
/* (anciennement window.load → hidden : supprimé) */

/* ═══ Curseur ═══ */
(function initCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  let mouseX = 0,
    mouseY = 0,
    ringX = 0,
    ringY = 0;

  document.addEventListener("mousemove", (e) => {
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

  const interactives = document.querySelectorAll(
    "a, button, .skill-stat-row, .project-item, .method-step, .pillar, .loader-kbd"
  );
  interactives.forEach((el) => {
    el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });
})();

/* ═══ Nav ═══ */
(function initNav() {
  const header = document.getElementById("header");
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      burger.classList.toggle("open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navLinks.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          links.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((s) => sectionObserver.observe(s));
})();

/* ═══ Reveal ═══ */
(function initReveal() {
  const elements = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || "0", 10);
        setTimeout(() => el.classList.add("visible"), delay);
        observer.unobserve(el);
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ═══ Smooth scroll ═══ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();

/* ═══ Parallax orbes ═══ */
(function initParallax() {
  const orbs = document.querySelectorAll(".orb");
  if (!orbs.length) return;

  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        orbs.forEach((orb, i) => {
          const speed = [0.07, 0.04, 0.1][i] || 0.07;
          orb.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
    },
    { passive: true }
  );
})();

/* ═══ Tilt stats (desktop) ═══ */
(function initStatTilt() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".skill-stat-row").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(700px) rotateX(${dy * -1.2}deg) rotateY(${dx * 1.2}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();
