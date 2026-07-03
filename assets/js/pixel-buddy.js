/* ═══ Compagnon Creeper — fixe au spawn, drag user, yeux, triple-clic ═══ */
(function initPixelBuddy() {
  const root = document.getElementById("pixelBuddy");
  const bubble = document.getElementById("buddyBubble");
  const bubbleText = document.getElementById("buddyBubbleText");
  const face = document.getElementById("buddyFace");
  const sprite = document.getElementById("buddySprite");
  const pupilL = document.getElementById("buddyPupilL");
  const pupilR = document.getElementById("buddyPupilR");
  if (!root || !bubble || !bubbleText || !face || !sprite) return;

  root.style.opacity = "0";

  const BUDDY_BOX = 64;
  const EDGE = 16;
  const HEADER_SAFE = 72;
  const MSG_VISIBLE_MS = 9500;
  const MSG_PAUSE_MS = 4500;
  const FIRST_MSG_DELAY_MS = 12000;
  const INTRO_KEY = "creeper_intro_v3";
  const DRAG_THRESHOLD = 7;
  const RAGE_WINDOW_MS = 3000;
  const RAGE_LIMIT = 3;
  const TAP_MAX_MS = 280;

  /* Spawn fixe : un peu à gauche du bord droit, un peu haut */
  const SPAWN = { side: "right", yRatio: 0.26, xInset: 72 };

  const SECTION_IDS = ["hero", "about", "skills", "projects", "timeline", "method", "contact"];

  const CREEPER_INTRO = {
    t: "Salut. Je suis là pour t’orienter un peu sur le site — sans trop t’embêter.",
    m: "normal",
  };

  const CREEPER_LINES = [
    { t: "Ryan montre ici ce qu’il sait faire, ce qu’il apprend et ce qu’il veut viser.", m: "normal" },
    { t: "Pas envie de tout lire ? Le TL;DR dans À propos résume pas mal.", m: "normal" },
    { t: "Les barres de compétences, c’est une idée générale — ça évolue avec les projets.", m: "normal" },
    { t: "Les projets OpenClassrooms, c’est la formation. Sakalava et DigiJet, c’est le terrain.", m: "normal" },
    { t: "Il cherche une alternance dev web à Toulouse, au cas où.", m: "normal" },
    { t: "Contact en bas si le profil te parle.", m: "normal" },
    { t: "F5 relance le loader. Utile si t’as rien d’autre à faire.", m: "silly" },
    { t: "Tu m’as déjà fait exploser une fois. Impossible à prouver.", m: "silly" },
    { t: "Merci de rester un peu — ça veut dire que le contenu t’intéresse.", m: "normal" },
  ];

  const BY_SECTION = {
    hero: [
      { t: "Le hero, c’est l’accroche. La suite, c’est le fond.", m: "normal" },
      { t: "« The one you need », c’est volontairement un peu direct.", m: "normal" },
    ],
    about: [
      { t: "Parcours en bref, puis en détail.", m: "normal" },
      { t: "Junior, oui — mais il monte en niveau sur des vrais sujets.", m: "normal" },
    ],
    skills: [
      { t: "Là où il passe le plus de temps, globalement.", m: "normal" },
      { t: "Personne ne maîtrise tout le web. L’important, c’est d’avancer.", m: "normal" },
    ],
    projects: [
      { t: "Le contexte compte autant que le rendu final.", m: "normal" },
      { t: "Chaque projet a son livrable ou sa démo — clique si tu veux voir.", m: "normal" },
    ],
    timeline: [
      { t: "Parcours pas linéaire, mais chaque étape a compté.", m: "normal" },
      { t: "Graphisme, technique, dev, gestion de projet : tout s’enchaîne.", m: "normal" },
    ],
    method: [
      { t: "Comprendre, construire, tester, améliorer.", m: "normal" },
      { t: "Une méthode simple, mais ça évite de partir dans tous les sens.", m: "normal" },
    ],
    contact: [
      { t: "Mail, téléphone, LinkedIn : trois façons de le joindre.", m: "normal" },
      { t: "Un message suffit si tu veux échanger.", m: "normal" },
    ],
  };

  const DRAG_QUIPS = [
    { t: "Euh… je bouge pas comme ça d’habitude.", m: "angry" },
    { t: "T’as quel âge pour jouer avec moi comme ça ?", m: "silly" },
    { t: "Pose-moi quelque part et lis un peu ce portfolio !", m: "silly" },
  ];

  const SHAKE_QUIPS = [
    { t: "Doucement.", m: "angry" },
    { t: "Ça secoue un peu là.", m: "angry" },
    { t: "Arrête de me secouer.", m: "angry" },
  ];

  const RAGE_WARN = {
    t: "Encore un clic et j’explose. Sans blague, cette fois.",
    m: "warn",
  };

  let x = 0;
  let y = 0;
  let active = false;
  let isDead = false;
  let isDragging = false;
  let pointerDown = false;
  let dragStarted = false;
  let dragOffX = 0;
  let dragOffY = 0;
  let dragPath = 0;
  let lastDragX = 0;
  let lastDragY = 0;
  let pointerDownX = 0;
  let pointerDownY = 0;
  let pointerDownAt = 0;
  let lastShakeAt = 0;
  let msgTimer = null;
  let msgHideTimer = null;
  let introShownMemory = false;
  let rageClicks = 0;
  let rageResetTimer = null;

  function getActiveSection() {
    const yRef = window.innerHeight * 0.35;
    let best = "hero";
    let bestDist = Infinity;
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 60 || r.top > window.innerHeight - 60) continue;
      const anchor = r.top + Math.min(r.height * 0.3, 100);
      const d = Math.abs(anchor - yRef);
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    }
    return best;
  }

  function hasIntroBeenShown() {
    if (introShownMemory) return true;
    try {
      if (sessionStorage.getItem(INTRO_KEY) === "1") {
        introShownMemory = true;
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }

  function markIntroShown() {
    introShownMemory = true;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickLine() {
    if (Math.random() < 0.4) {
      const pool = BY_SECTION[getActiveSection()];
      if (pool?.length) return pickRandom(pool);
    }
    return pickRandom(CREEPER_LINES);
  }

  function hideBubbleFn() {
    bubble.hidden = true;
    if (!sprite.classList.contains("is-annoyed")) {
      face.setAttribute("data-mood", "normal");
    }
  }

  function applyTransform() {
    root.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
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
      if (!active || document.hidden || isDragging || isDead) {
        runNextAutoMessage(500);
        return;
      }
      let item;
      if (!hasIntroBeenShown()) {
        markIntroShown();
        item = CREEPER_INTRO;
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
    if (isDead) return;
    clearMsgTimers();
    bubbleText.textContent = item.t;
    face.setAttribute("data-mood", item.m);
    bubble.hidden = false;
    msgHideTimer = setTimeout(() => {
      hideBubbleFn();
      runNextAutoMessage(resumeDelayMs);
    }, visibleMs);
  }

  function clampPos(nx, ny) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxX = Math.max(EDGE, w - EDGE - BUDDY_BOX);
    const maxY = Math.max(EDGE + HEADER_SAFE, h - EDGE - BUDDY_BOX);
    return {
      x: Math.min(maxX, Math.max(EDGE, nx)),
      y: Math.min(maxY, Math.max(EDGE + HEADER_SAFE, ny)),
    };
  }

  function computeSpawnPos() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxX = Math.max(EDGE, w - EDGE - BUDDY_BOX);
    const targetX = SPAWN.side === "left" ? EDGE + SPAWN.xInset : maxX - SPAWN.xInset;
    const rawY = h * SPAWN.yRatio - BUDDY_BOX / 2;
    return clampPos(targetX, rawY);
  }

  function placeAtSpawn() {
    const p = computeSpawnPos();
    x = p.x;
    y = p.y;
    applyTransform();
  }

  function updateEyeTracking(e) {
    if (!pupilL || !pupilR || isDead || !active) return;
    const rect = sprite.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxPupil = 3;
    const factor = Math.min(1, dist / 320) * maxPupil;
    const angle = Math.atan2(dy, dx);
    const px = Math.cos(angle) * factor;
    const py = Math.sin(angle) * factor;
    const t = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px)`;
    pupilL.style.transform = t;
    pupilR.style.transform = t;
  }

  function resetRageState() {
    rageClicks = 0;
    sprite.classList.remove("is-annoyed");
    face.setAttribute("data-mood", "normal");
  }

  function explodeBuddy() {
    if (isDead) return;
    isDead = true;
    active = false;
    clearMsgTimers();
    clearTimeout(rageResetTimer);
    hideBubbleFn();
    sprite.classList.remove("is-annoyed");
    face.setAttribute("data-mood", "angry");
    root.classList.add("is-exploding");
    window.setTimeout(() => {
      root.classList.add("is-dead");
      root.setAttribute("aria-hidden", "true");
    }, 720);
  }

  function registerRageTap() {
    if (isDead || isDragging) return;
    rageClicks += 1;
    clearTimeout(rageResetTimer);

    if (rageClicks >= RAGE_LIMIT) {
      explodeBuddy();
      return;
    }

    if (rageClicks === 2) {
      sprite.classList.add("is-annoyed");
      showInteractionBubble(RAGE_WARN, 3500, 8000);
    } else {
      face.setAttribute("data-mood", "silly");
      window.setTimeout(() => {
        if (rageClicks < 2 && !isDead) face.setAttribute("data-mood", "normal");
      }, 500);
    }

    rageResetTimer = window.setTimeout(resetRageState, RAGE_WINDOW_MS);
  }

  function beginDrag(e) {
    isDragging = true;
    dragStarted = true;
    sprite.classList.add("is-dragging");
    dragOffX = e.clientX - x;
    dragOffY = e.clientY - y;
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    dragPath = 0;
    clearMsgTimers();
    hideBubbleFn();
    showInteractionBubble(pickRandom(DRAG_QUIPS), 4000, 9000);
    document.addEventListener("pointermove", onDocPointerMove, { passive: true });
    document.addEventListener("pointerup", onDocPointerUp);
    document.addEventListener("pointercancel", onDocPointerUp);
  }

  function onDocPointerMove(e) {
    if (!pointerDown && !isDragging) return;

    if (pointerDown && !dragStarted) {
      const moved = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (moved > DRAG_THRESHOLD) beginDrag(e);
      return;
    }

    if (!isDragging) return;
    const c = clampPos(e.clientX - dragOffX, e.clientY - dragOffY);
    x = c.x;
    y = c.y;
    applyTransform();
    const dx = e.clientX - lastDragX;
    const dy = e.clientY - lastDragY;
    dragPath += Math.hypot(dx, dy);
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    const now = performance.now();
    if (dragPath > 200 && now - lastShakeAt > 4000) {
      lastShakeAt = now;
      dragPath = 0;
      showInteractionBubble(pickRandom(SHAKE_QUIPS), 4000, 9000);
    }
  }

  function endPointer(e) {
    document.removeEventListener("pointermove", onDocPointerMove);
    document.removeEventListener("pointerup", onDocPointerUp);
    document.removeEventListener("pointercancel", onDocPointerUp);

    if (pointerDown && !dragStarted && e) {
      const elapsed = performance.now() - pointerDownAt;
      const moved = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (elapsed < TAP_MAX_MS && moved < DRAG_THRESHOLD) {
        registerRageTap();
      }
    }

    if (isDragging) {
      isDragging = false;
      sprite.classList.remove("is-dragging");
    }

    pointerDown = false;
    dragStarted = false;
  }

  function onDocPointerUp(e) {
    endPointer(e);
  }

  function onSpritePointerDown(e) {
    if (e.button !== 0 || isDead) return;
    e.preventDefault();
    pointerDown = true;
    dragStarted = false;
    pointerDownX = e.clientX;
    pointerDownY = e.clientY;
    pointerDownAt = performance.now();
    lastDragX = e.clientX;
    lastDragY = e.clientY;
    document.addEventListener("pointermove", onDocPointerMove, { passive: true });
    document.addEventListener("pointerup", onDocPointerUp);
    document.addEventListener("pointercancel", onDocPointerUp);
  }

  sprite.addEventListener("pointerdown", onSpritePointerDown);
  document.addEventListener("mousemove", updateEyeTracking, { passive: true });

  function startBuddy() {
    if (active) return;
    active = true;
    root.style.opacity = "1";
    root.setAttribute("aria-hidden", "false");
    placeAtSpawn();
    runNextAutoMessage(FIRST_MSG_DELAY_MS);

    window.addEventListener(
      "resize",
      () => {
        const c = clampPos(x, y);
        x = c.x;
        y = c.y;
        applyTransform();
      },
      { passive: true }
    );
  }

  document.addEventListener("portfolio:loaderDone", startBuddy, { once: true });
})();
