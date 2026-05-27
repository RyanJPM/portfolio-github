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

/* ═══ Avatar pixel — Ryan (errance, bulles, drag + secousse) ═══ */
(function initPixelBuddy() {
  const root = document.getElementById("pixelBuddy");
  const bubble = document.getElementById("buddyBubble");
  const bubbleText = document.getElementById("buddyBubbleText");
  const face = document.getElementById("buddyFace");
  const sprite = document.getElementById("buddySprite");
  if (!root || !bubble || !bubbleText || !face || !sprite) return;

  root.style.opacity = "0";

  const SECTION_IDS = ["hero", "about", "skills", "projects", "timeline", "method", "contact"];
  const BUDDY_BOX = 72;
  const EDGE = 20;
  const MSG_VISIBLE_MS = 10000;
  const MSG_PAUSE_MS = 5000;
  const FIRST_MSG_DELAY_MS = 15000;
  const RYAN_INTRO_KEY = "ryan_intro_v1";

  const RYAN_INTRO = {
    t: "Bienvenue sur mon portfolio. Ici, je montre ce que je construis, ce que j’apprends et ce que je veux développer.",
    m: "normal",
  };

  const RYAN_SELF = [
    { t: "Je touche au dev, au design, à WordPress, à l’IA… le but, c’est de relier tout ça proprement.", m: "normal" },
    { t: "Je suis encore junior, mais j’avance vite et je cherche à progresser sur des projets concrets.", m: "normal" },
    { t: "Tu peux scroller : le plus intéressant est souvent un peu plus bas.", m: "normal" },
    { t: "Je préfère un site clair et vivant qu’un portfolio trop figé.", m: "normal" },
    { t: "Pas de blabla inutile : du concret, du travail, de l’apprentissage.", m: "normal" },
    { t: "F5 pour revoir le loader — je l’assume.", m: "silly" },
    { t: "Les bulles pixel, c’est ma façon d’accueillir sans t’ennuyer.", m: "silly" },
  ];

  const RYAN_PROFILE = [
    { t: "J’utilise l’IA quand ça sert le projet — pas pour remplir une page.", m: "normal" },
    { t: "Je touche à plusieurs domaines : front, CMS, pilotage, un peu de tout.", m: "normal" },
    { t: "Les stats sont indicatives : elles évoluent avec mes projets, mes galères et mon apprentissage.", m: "normal" },
    { t: "Alternance + projets perso : j’apprends vite, le repo suit (en général).", m: "normal" },
    { t: "Je livre, j’apprends, je corrige — c’est mon rythme du moment.", m: "normal" },
    { t: "Je cherche une alternance dev web à Toulouse : motivé, curieux, prêt à m’investir.", m: "normal" },
    { t: "Discord existe, mais ce n’est pas ma vitrine pro. Logique.", m: "silly" },
  ];

  const RYAN_COMMENT = [
    { t: "Le hero, c’est l’accroche. La suite, c’est le fond.", m: "normal" },
    { t: "« The one you need » : volontairement accrocheur, c’est le but.", m: "silly" },
    { t: "Le TL;DR en haut, c’est pour aller vite sans rater l’essentiel.", m: "normal" },
    { t: "Site statique : rapide, simple, efficace à héberger.", m: "normal" },
    { t: "Si tu scrolles encore, merci — ça veut dire que ça t’intéresse un peu.", m: "normal" },
    { t: "Le bouton Contact est là si tu veux échanger.", m: "normal" },
    { t: "Je ne juge pas ton navigateur. Sauf s’il casse mon CSS.", m: "silly" },
  ];

  const BY_SECTION = {
    hero: [
      { t: "Bienvenue. En haut, le résumé ; en dessous, le détail.", m: "normal" },
      { t: "« The one you need » : oui, c’est volontairement un peu culotté.", m: "silly" },
    ],
    about: [
      { t: "Ici, mon parcours en version courte puis en version honnête.", m: "normal" },
      { t: "Junior, oui — mais je monte en niveau sur des vrais sujets.", m: "normal" },
    ],
    skills: [
      { t: "Les barres reflètent où je passe le plus de temps — ça bouge avec les projets.", m: "normal" },
      { t: "On ne maîtrise jamais tout sur le web. L’important, c’est de progresser.", m: "normal" },
    ],
    projects: [
      { t: "Ici, le contexte compte autant que le rendu.", m: "normal" },
      { t: "Je préfère montrer ce que j’ai vraiment construit.", m: "normal" },
    ],
    timeline: [
      { t: "Mon parcours n’est pas linéaire, mais chaque étape a servi.", m: "normal" },
      { t: "Graphisme, technique, dev, projet : tout s’enchaîne.", m: "normal" },
    ],
    method: [
      { t: "Ma logique : comprendre, construire, tester, améliorer.", m: "normal" },
      { t: "Le cadre m’évite de faire joli pour rien.", m: "normal" },
    ],
    contact: [
      { t: "Mail, téléphone, LinkedIn : trois façons de me joindre.", m: "normal" },
      { t: "Un message suffit si le profil te parle.", m: "normal" },
    ],
  };

  const DRAG_QUIPS = [
    { t: "Hé, doucement… je ne suis pas une icône à déplacer.", m: "angry" },
    { t: "Ok, tu me bouges. Je note.", m: "silly" },
    { t: "Je me laisse faire, mais avec style.", m: "silly" },
    { t: "Tu gagnes : je bouge. Mais je garde mon style.", m: "silly" },
  ];

  const SHAKE_QUIPS = [
    { t: "Doucement, je suis en pixels, pas en caoutchouc.", m: "angry" },
    { t: "Secousse détectée. Humeur : moyenne.", m: "angry" },
    { t: "Arrête de me secouer, je perds des FPS.", m: "silly" },
    { t: "Un clic suffit, en général.", m: "normal" },
  ];

  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let wanderActive = false;
  let isDragging = false;
  let dragOffX = 0;
  let dragOffY = 0;
  let dragPath = 0;
  let lastDragX = 0;
  let lastDragY = 0;
  let lastShakeAt = 0;
  let msgTimer = null;
  let msgHideTimer = null;
  let ryanIntroShownMemory = false;

  function getActiveSection() {
    const yRef = window.innerHeight * 0.32;
    let best = "hero";
    let bestDist = Infinity;
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 40 || r.top > window.innerHeight - 40) continue;
      const anchor = r.top + Math.min(r.height * 0.25, 120);
      const d = Math.abs(anchor - yRef);
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    }
    return best;
  }

  function hasRyanIntroBeenShown() {
    if (ryanIntroShownMemory) return true;
    try {
      if (sessionStorage.getItem(RYAN_INTRO_KEY) === "1") {
        ryanIntroShownMemory = true;
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }

  function markRyanIntroShown() {
    ryanIntroShownMemory = true;
    try {
      sessionStorage.setItem(RYAN_INTRO_KEY, "1");
    } catch {
      /* navigation privée, etc. */
    }
  }

  function pickLine() {
    if (Math.random() < 1 / 3) {
      const sec = getActiveSection();
      const pool = BY_SECTION[sec];
      if (pool?.length) {
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
    const r = Math.random();
    if (r < 0.34) return pickRandom(RYAN_SELF);
    if (r < 0.67) return pickRandom(RYAN_PROFILE);
    return pickRandom(RYAN_COMMENT);
  }

  function hideBubbleFn() {
    bubble.hidden = true;
    face.setAttribute("data-mood", "normal");
  }

  function applyTransform() {
    root.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  function clearMsgTimers() {
    clearTimeout(msgTimer);
    clearTimeout(msgHideTimer);
    msgTimer = null;
    msgHideTimer = null;
  }

  function runNextAutoMessage(delay) {
    clearMsgTimers();
    msgTimer = setTimeout(() => {
      if (!wanderActive || document.hidden || isDragging) {
        runNextAutoMessage(500);
        return;
      }
      let item;
      if (!hasRyanIntroBeenShown()) {
        markRyanIntroShown();
        item = RYAN_INTRO;
      } else {
        item = pickLine();
      }
      bubbleText.textContent = item.t;
      face.setAttribute("data-mood", item.m);
      bubble.hidden = false;
      msgHideTimer = setTimeout(() => {
        hideBubbleFn();
        msgTimer = setTimeout(() => runNextAutoMessage(0), MSG_PAUSE_MS);
      }, MSG_VISIBLE_MS);
    }, delay);
  }

  function showInteractionBubble(item, visibleMs, resumeDelayMs) {
    clearMsgTimers();
    bubbleText.textContent = item.t;
    face.setAttribute("data-mood", item.m);
    bubble.hidden = false;
    msgHideTimer = setTimeout(() => {
      hideBubbleFn();
      runNextAutoMessage(resumeDelayMs);
    }, visibleMs);
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomTarget() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxX = Math.max(EDGE, w - EDGE - BUDDY_BOX);
    const maxY = Math.max(EDGE, h - EDGE - BUDDY_BOX);
    tx = EDGE + Math.random() * (maxX - EDGE);
    ty = h * (0.18 + Math.random() * 0.54);
    ty = Math.min(maxY, Math.max(EDGE, ty));
  }

  function clampPos(nx, ny) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxX = Math.max(EDGE, w - EDGE - BUDDY_BOX);
    const maxY = Math.max(EDGE, h - EDGE - BUDDY_BOX);
    return {
      x: Math.min(maxX, Math.max(EDGE, nx)),
      y: Math.min(maxY, Math.max(EDGE, ny)),
    };
  }

  function rafWander() {
    if (wanderActive && !isDragging) {
      x += (tx - x) * 0.012;
      y += (ty - y) * 0.012;
      const dx = tx - x;
      const dy = ty - y;
      if (dx * dx + dy * dy < 36) {
        randomTarget();
      }
      applyTransform();
    }
    requestAnimationFrame(rafWander);
  }

  function initWanderPosition() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    x = Math.max(EDGE, w * 0.65);
    y = h * 0.42;
    randomTarget();
  }

  function onDocPointerMove(e) {
    if (!isDragging) return;
    const nx = e.clientX - dragOffX;
    const ny = e.clientY - dragOffY;
    const c = clampPos(nx, ny);
    x = c.x;
    y = c.y;
    applyTransform();
    const dx = e.clientX - lastDragX;
    const dy = e.clientY - lastDragY;
    dragPath += Math.hypot(dx, dy);
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    const now = performance.now();
    if (dragPath > 220 && now - lastShakeAt > 4000) {
      lastShakeAt = now;
      dragPath = 0;
      showInteractionBubble(pickRandom(SHAKE_QUIPS), 4000, 9000);
    }
  }

  function endDragFromDoc() {
    if (!isDragging) return;
    isDragging = false;
    sprite.classList.remove("is-dragging");
    document.removeEventListener("pointermove", onDocPointerMove);
    document.removeEventListener("pointerup", onDocPointerUp);
    document.removeEventListener("pointercancel", onDocPointerUp);
    randomTarget();
  }

  function onDocPointerUp() {
    endDragFromDoc();
  }

  function onSpritePointerDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    isDragging = true;
    sprite.classList.add("is-dragging");
    dragOffX = e.clientX - x;
    dragOffY = e.clientY - y;
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    dragPath = 0;
    clearMsgTimers();
    hideBubbleFn();
    showInteractionBubble(pickRandom(DRAG_QUIPS), 4500, 9000);
    tx = x;
    ty = y;
    document.addEventListener("pointermove", onDocPointerMove, { passive: true });
    document.addEventListener("pointerup", onDocPointerUp);
    document.addEventListener("pointercancel", onDocPointerUp);
  }

  sprite.addEventListener("pointerdown", onSpritePointerDown);

  function startWanderAndMessages() {
    if (wanderActive) return;
    wanderActive = true;
    root.style.opacity = "1";
    root.setAttribute("aria-hidden", "false");
    initWanderPosition();
    randomTarget();
    runNextAutoMessage(FIRST_MSG_DELAY_MS);

    window.addEventListener(
      "resize",
      () => {
        const c = clampPos(x, y);
        x = c.x;
        y = c.y;
        const c2 = clampPos(tx, ty);
        tx = c2.x;
        ty = c2.y;
        applyTransform();
      },
      { passive: true }
    );
  }

  requestAnimationFrame(rafWander);

  setInterval(() => {
    if (wanderActive && !document.hidden && !isDragging) {
      randomTarget();
    }
  }, 9000 + Math.random() * 6000);

  document.addEventListener("portfolio:loaderDone", startWanderAndMessages, { once: true });
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
