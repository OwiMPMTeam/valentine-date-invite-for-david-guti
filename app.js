// ============================================
// Valentine Microsite — app.js (FULL)
// ============================================

const $ = (id) => document.getElementById(id);

function showOnly(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const el = $(screenId);
  if (el) el.classList.add("active");
}

const screens = {
  password: "screen-password",
  cover: "screen-cover",
  question: "screen-question",
  schedule: "screen-schedule",
  gift: "screen-gift",
};

function showScreen(key) {
  showOnly(screens[key]);
}

// ============================================
// PASSWORD GATE
// ============================================

const pwInput = $("pwInput");
const pwBtn = $("pwBtn");
const pwError = $("pwError");

let pwFails = 0;
let gossipGifEl = null;

function normalizePw(raw) {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,]/g, "")
    .replace(/(st|nd|rd|th)\b/g, "")
    .trim();
}

function isValidPassword(input) {
  const v = normalizePw(input);
  const accepted = new Set([
    "october 3",
    "oct 3",
    "october3",
    "oct3",
    "10/3",
    "10-3",
    "10 3",
    "103",
    "10 03",
    "10/03",
    "10-03",
    "october 03",
    "oct 03",
    "october third",
    "oct third",
  ]);
  return accepted.has(v);
}

function showPwMessage(msg, tone = "error") {
  if (!pwError) return;
  pwError.classList.remove("hidden");
  pwError.textContent = msg;
  pwError.style.color = tone === "error" ? "#b8002a" : "rgba(0,0,0,0.72)";
}

function removeGossipGif() {
  if (gossipGifEl) {
    gossipGifEl.remove();
    gossipGifEl = null;
  }
}

function spawnGossipGifRandomly() {
  if (gossipGifEl) return;

  gossipGifEl = document.createElement("img");
  gossipGifEl.src = "./assets/password/gossip.gif";
  gossipGifEl.alt = "Gossip girl gif";
  gossipGifEl.className = "gossipGif";

  const x = Math.random() * 70 + 15;
  const y = Math.random() * 55 + 18;
  gossipGifEl.style.left = `${x}%`;
  gossipGifEl.style.top = `${y}%`;

  const rot = (Math.random() * 10) - 5;
  const sc = (Math.random() * 0.18) + 0.95;
  gossipGifEl.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${sc})`;

  const screen = $(screens.password);
  if (screen) screen.prepend(gossipGifEl);
}

function handlePasswordSubmit() {
  const val = pwInput ? pwInput.value : "";

  if (isValidPassword(val)) {
    if (pwError) pwError.classList.add("hidden");
    pwFails = 0;
    removeGossipGif();
    showScreen("cover");
    return;
  }

  pwFails += 1;

  if (pwFails === 1) {
    showPwMessage("Nope 😼 try again.", "error");
    return;
  }

  if (pwFails === 2) {
    showPwMessage('Hint: “Gossip Girls: asked him for the weather”', "error");
    spawnGossipGifRandomly();
    return;
  }

  showPwMessage("It’s October 3 🙄 girl… come on", "soft");
}

if (pwBtn) pwBtn.addEventListener("click", handlePasswordSubmit);
if (pwInput) {
  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handlePasswordSubmit();
  });
}

// ============================================
// COVER: Parallax (desktop + touch + phone tilt)
// ============================================

const parallaxArea = $("parallaxArea");
let parallaxItems = [];
let parallaxOn = false;

let targetX = 0, targetY = 0; // -1..1
let curX = 0, curY = 0;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

function setTargetFromClient(clientX, clientY) {
  if (!parallaxArea) return;
  const r = parallaxArea.getBoundingClientRect();
  const nx = ((clientX - r.left) / r.width) * 2 - 1;
  const ny = ((clientY - r.top) / r.height) * 2 - 1;
  targetX = clamp(nx, -1, 1);
  targetY = clamp(ny, -1, 1);
}

function applyParallax() {
  // stronger parallax: multiply by ~1.35
  const strength = 1.35;

  parallaxItems.forEach((el) => {
    const depth = Number(el.dataset.depth || "18");
    const dx = curX * depth * strength;
    const dy = curY * depth * strength;

    // Store px/py for bg zoom animation CSS
    el.style.setProperty("--px", `${dx}px`);
    el.style.setProperty("--py", `${dy}px`);

    // IMPORTANT: This overwrites transform, so we keep "base rotation"
    // by using a data-rot attribute set once from computed style.
    const rot = el.dataset.rot || "0deg";
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot})`;
  });
}

function parallaxLoop() {
  if (!parallaxOn) return;
  curX = lerp(curX, targetX, 0.09);
  curY = lerp(curY, targetY, 0.09);
  applyParallax();
  requestAnimationFrame(parallaxLoop);
}

function captureInitialRotations() {
  parallaxItems.forEach((el) => {
    // read the inline rotation we set via CSS vars as a fallback:
    // if it's a decor, we stored --r in CSS; for safety we detect class.
    if (el.classList.contains("d1")) el.dataset.rot = "-7deg";
    if (el.classList.contains("d2")) el.dataset.rot = "8deg";
    if (el.classList.contains("d3")) el.dataset.rot = "-5deg";
    if (el.classList.contains("u1")) el.dataset.rot = "4deg";
  });
}

function setupParallax() {
  if (!parallaxArea) return;
  parallaxItems = Array.from(parallaxArea.querySelectorAll(".parallax"));
  if (!parallaxItems.length) return;

  captureInitialRotations();

  parallaxOn = true;
  requestAnimationFrame(parallaxLoop);

  // Desktop mouse
  parallaxArea.addEventListener("mousemove", (e) => {
    setTargetFromClient(e.clientX, e.clientY);
  }, { passive: true });

  // Touch move (mobile “hover” substitute)
  parallaxArea.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    setTargetFromClient(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  // If no movement, keep a gentle drift
  setInterval(() => {
    // tiny wandering when user does nothing
    targetX = clamp(targetX + (Math.random() * 0.2 - 0.1), -0.6, 0.6);
    targetY = clamp(targetY + (Math.random() * 0.2 - 0.1), -0.6, 0.6);
  }, 2200);
}

setupParallax();

// Phone tilt parallax (optional; iOS requires permission)
let deviceTiltEnabled = false;

async function requestTiltPermissionIfNeeded() {
  // iOS needs explicit permission for device orientation
  try {
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      const res = await DeviceOrientationEvent.requestPermission();
      deviceTiltEnabled = (res === "granted");
    } else {
      // Android/others usually just work
      deviceTiltEnabled = true;
    }
  } catch (e) {
    deviceTiltEnabled = false;
  }
}

function enableDeviceTilt() {
  if (!deviceTiltEnabled) return;

  window.addEventListener("deviceorientation", (e) => {
    // gamma: left/right (-90..90), beta: front/back (-180..180)
    const g = clamp((e.gamma || 0) / 35, -1, 1);
    const b = clamp((e.beta || 0) / 45, -1, 1);

    // Use tilt to set target; keep subtle so it feels romantic not chaotic
    targetX = lerp(targetX, g, 0.15);
    targetY = lerp(targetY, b * 0.6, 0.15);
  }, { passive: true });
}

// ============================================
// COVER: Letter tap -> swap GIF + sparkles + zoom + background zoom
// ============================================

const letterStack = $("letterStack");
const letterGif = $("letterGif");
const sparkles = $("sparkles");

function burstSparkles() {
  if (!sparkles) return;

  const symbols = ["✨","⚡️","💫","💕","✨","⚡️","✨","💞"];
  const sizes = ["s1","s2","s3","s4"];

  sparkles.innerHTML = "";

  for (let i = 0; i < 16; i++) {
    const s = document.createElement("div");
    s.className = `spark ${sizes[Math.floor(Math.random() * sizes.length)]}`;
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    // cluster around the letter (center area)
    const cx = 50 + (Math.random() * 34 - 17);
    const cy = 50 + (Math.random() * 34 - 17);
    s.style.left = `${cx}%`;
    s.style.top = `${cy}%`;

    // drift
    const dx = (Math.random() * 220 - 110).toFixed(0) + "px";
    const dy = (Math.random() * 200 - 140).toFixed(0) + "px";
    s.style.setProperty("--dx", dx);
    s.style.setProperty("--dy", dy);

    // stagger
    s.style.animationDelay = `${Math.random() * 160}ms`;

    sparkles.appendChild(s);
  }

  setTimeout(() => { sparkles.innerHTML = ""; }, 980);
}

function goToQuestionFromCover() {
  if (!letterStack || !letterGif) return;

  // (optional) ask for tilt permission once we have user interaction
  requestTiltPermissionIfNeeded().then(() => {
    if (deviceTiltEnabled) enableDeviceTilt();
  });

  // swap to opening gif
  letterGif.src = "./assets/cover/Letter_Opening.gif";

  // sparkles
  burstSparkles();

  // zoom animations: letter + background
  letterStack.classList.add("zooming");
  if (parallaxArea) parallaxArea.classList.add("zooming");

  // boost parallax while zooming for extra drama
  targetX = clamp(targetX * 1.35, -1, 1);
  targetY = clamp(targetY * 1.35, -1, 1);

  setTimeout(() => {
    // reset for replay
    letterGif.src = "./assets/cover/Letter_Flying.gif";
    letterStack.classList.remove("zooming");
    if (parallaxArea) parallaxArea.classList.remove("zooming");

    showScreen("question");
  }, 720);
}

if (letterStack) {
  letterStack.addEventListener("click", goToQuestionFromCover);
  letterStack.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") goToQuestionFromCover();
  });
}

// ============================================
// QUESTION SCREEN
// ============================================

const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const questionBgImg = $("questionBgImg");
let noClicks = 0;

function updateNoYesSizes() {
  if (!yesBtn || !noBtn) return;

  const yesScale = 1 + (noClicks * 0.18);
  const noScale  = Math.max(0.55, 1 - (noClicks * 0.10));

  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform  = `scale(${noScale})`;

  if (noClicks >= 6) {
    noBtn.disabled = true;
    noBtn.textContent = "Nope. Not an option 😌";
    yesBtn.style.transform = "scale(2.2)";
    if (questionBgImg) questionBgImg.src = "./assets/question/bg2.gif"; // optional
  }
}

if (noBtn) {
  noBtn.addEventListener("click", () => {
    noClicks += 1;
    updateNoYesSizes();
  });
}

if (yesBtn) {
  yesBtn.addEventListener("click", () => {
    showScreen("schedule");
  });
}

// ============================================
// SCHEDULE -> GIFT
// ============================================

const giftBtn = $("giftBtn");
const roseField = $("roseField");

if (giftBtn) {
  giftBtn.addEventListener("click", () => {
    showScreen("gift");
    if (roseField) {
      roseField.innerHTML = "";
      for (let i = 0; i < 24; i++) {
        const d = document.createElement("div");
        d.className = "rose";
        d.textContent = "🌹";
        roseField.appendChild(d);
      }
    }
  });
}

// ============================================
// RESTART
// ============================================

const restartBtn = $("restartBtn");

function resetAll() {
  pwFails = 0;
  noClicks = 0;

  if (pwInput) pwInput.value = "";
  if (pwError) pwError.classList.add("hidden");
  removeGossipGif();

  if (noBtn) {
    noBtn.disabled = false;
    noBtn.textContent = "Hell nah, Keysha!";
    noBtn.style.transform = "";
  }
  if (yesBtn) yesBtn.style.transform = "";
  if (questionBgImg) questionBgImg.src = "./assets/question/bg.gif";

  if (letterGif) letterGif.src = "./assets/cover/Letter_Flying.gif";
  if (letterStack) letterStack.classList.remove("zooming");
  if (parallaxArea) parallaxArea.classList.remove("zooming");
  if (sparkles) sparkles.innerHTML = "";

  // reset parallax targets so it centers nicely
  targetX = 0; targetY = 0;
  curX = 0; curY = 0;

  showScreen("password");
}

if (restartBtn) restartBtn.addEventListener("click", resetAll);
