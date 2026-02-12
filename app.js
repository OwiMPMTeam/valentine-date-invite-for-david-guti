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
// PASSWORD GATE (unchanged)
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
    "october 3","oct 3","october3","oct3",
    "10/3","10-3","10 3","103",
    "10 03","10/03","10-03","october 03","oct 03",
    "october third","oct third",
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
  if (pwFails === 1) return showPwMessage("Nope 😼 try again.", "error");
  if (pwFails === 2) { showPwMessage('Hint: “Gossip Girls: asked him for the weather”', "error"); return spawnGossipGifRandomly(); }
  showPwMessage("It’s October 3 🙄 girl… come on", "soft");
}

if (pwBtn) pwBtn.addEventListener("click", handlePasswordSubmit);
if (pwInput) pwInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handlePasswordSubmit(); });

// ============================================
// COVER: Parallax (keep as-is)
// ============================================

const parallaxArea = $("parallaxArea");
let parallaxItems = [];

let targetX = 0, targetY = 0;
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

function captureInitialRotations() {
  parallaxItems.forEach((el) => {
    if (el.classList.contains("d1")) el.dataset.rot = "-7deg";
    if (el.classList.contains("d2")) el.dataset.rot = "8deg";
    if (el.classList.contains("d3")) el.dataset.rot = "-5deg";
    if (el.classList.contains("u1")) el.dataset.rot = "4deg";
  });
}

function applyParallax() {
  const strength = 1.95;
  parallaxItems.forEach((el) => {
    const depth = Number(el.dataset.depth || "20");
    const dx = curX * depth * strength;
    const dy = curY * depth * strength;
    el.style.setProperty("--px", `${dx}px`);
    el.style.setProperty("--py", `${dy}px`);
    const rot = el.dataset.rot || "0deg";
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${rot})`;
  });
}

function loop() {
  curX = lerp(curX, targetX, 0.10);
  curY = lerp(curY, targetY, 0.10);
  applyParallax();
  requestAnimationFrame(loop);
}

(function setupParallax(){
  if (!parallaxArea) return;
  parallaxItems = Array.from(parallaxArea.querySelectorAll(".parallax"));
  if (!parallaxItems.length) return;
  captureInitialRotations();

  requestAnimationFrame(loop);

  parallaxArea.addEventListener("mousemove", (e) => setTargetFromClient(e.clientX, e.clientY), { passive: true });

  parallaxArea.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    setTargetFromClient(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
})();

// ============================================
// SPARKLES (MORE + LONGER + fade slowly across next screen)
// ============================================

const sparkles = $("sparkles");

function burstSparkles() {
  if (!sparkles) return;

  const symbols = ["✨","⚡️","💫","💕","💞","🏳️‍🌈","✨","⚡️","💫","🏳️‍🌈","💖","✨","✨"];
  const sizes = ["s1","s2","s3","s4","s5","s6"];

  // Don't clear immediately — we want them to persist into next screen
  // But do remove any old ones so it doesn't pile up forever:
  sparkles.innerHTML = "";

  const count = 120; // MORE MORE MORE 😈

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = `spark ${sizes[Math.floor(Math.random() * sizes.length)]}`;
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    // Spawn across the whole viewport, a bit beyond edges
    const cx = Math.random() * 120 - 10; // -10..110
    const cy = Math.random() * 80;       // 0..80
    s.style.left = `${cx}%`;
    s.style.top = `${cy}%`;

    // drift
    const dx = (Math.random() * 720 - 360).toFixed(0) + "px";
    const dy = (Math.random() * 420 - 220).toFixed(0) + "px";
    s.style.setProperty("--dx", dx);
    s.style.setProperty("--dy", dy);

    // stagger (sparkle explosions then fall)
    s.style.animationDelay = `${Math.random() * 1400}ms`;

    sparkles.appendChild(s);
  }

  // Let them fade out slowly even after next screen appears (7600ms + delay up to 1400ms)
  setTimeout(() => { sparkles.innerHTML = ""; }, 9800);
}

// ============================================
// COVER: Letter click -> go to question
// ============================================

const letterStack = $("letterStack");
const letterGif = $("letterGif");

function goToQuestionFromCover() {
  if (!letterStack || !letterGif) return;

  letterGif.src = "./assets/cover/Letter_Opening.gif";
  burstSparkles();

  letterStack.classList.add("zooming");
  if (parallaxArea) parallaxArea.classList.add("zooming");

  setTimeout(() => {
    // reset for replay
    letterGif.src = "./assets/cover/Letter_Flying.gif";
    letterStack.classList.remove("zooming");
    if (parallaxArea) parallaxArea.classList.remove("zooming");

    // move on — sparkles keep living because they're fixed + not cleared yet
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
// QUESTION SCREEN (your changes)
// ============================================

const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const questionBgImg = $("questionBgImg");
const noCounter = $("noCounter");

let noClicks = 0;
const maxNoClicks = 6;

function ensureQuestionStylingOnce() {
  // Text styling: make "valentine" red + emojis + stroke
  const titleEl = document.querySelector(`#${screens.question} .scribbleTitle`);
  if (titleEl && !titleEl.dataset.styled) {
    titleEl.dataset.styled = "1";
    titleEl.classList.add("strokeText");
    titleEl.innerHTML = `Will you be my <span style="color: rgba(255,110,130,0.95)">valentine</span>? 🥺💧🫶`;
  }

  // Buttons: pastel colors + text stroke
  if (yesBtn) {
    yesBtn.classList.add("yesBtn", "btnTextStroke");
    yesBtn.style.transformOrigin = "center";
  }
  if (noBtn) {
    noBtn.classList.add("noBtn", "btnTextStroke");
    noBtn.style.transformOrigin = "center";
  }

  // Counter text placement + default hidden message
  if (noCounter) {
    noCounter.classList.remove("hidden");
    noCounter.classList.add("rageNote");
    noCounter.innerHTML = "";
  }
}

function updateRageText() {
  if (!noCounter) return;

  if (noClicks === 0) {
    noCounter.innerHTML = "";
    return;
  }

  const left = Math.max(0, maxNoClicks - noClicks);
  noCounter.innerHTML = `Try me bitch. 😡 <span class="hot">${noClicks}</span> / ${maxNoClicks} (left: ${left})`;
}

function keepButtonsSideBySideWithGrowth() {
  // We keep both inside same row. We scale with transform (doesn't push layout).
  // And we slightly "nudge" YES toward NO so it feels like it's bullying it.
  if (!yesBtn || !noBtn) return;

  // Growth curve
  const yesScale = 1 + (noClicks * 0.22);   // grows faster
  const noScale  = Math.max(0.55, 1 - (noClicks * 0.11));

  // Apply as CSS variable for pound animation later
  yesBtn.style.setProperty("--scale", `${yesScale}`);

  // Slight horizontal nudge to keep them close as YES gets big
  const pull = Math.min(22, noClicks * 4); // px
  yesBtn.style.transform = `translateX(${pull}px) scale(${yesScale})`;
  noBtn.style.transform  = `translateX(${pull}px) scale(${noScale})`;
}

function onNoClick() {
  noClicks += 1;

  ensureQuestionStylingOnce();
  updateRageText();
  keepButtonsSideBySideWithGrowth();

  if (noClicks >= maxNoClicks) {
    // Disable NO and switch text
    noBtn.disabled = true;
    noBtn.textContent = "Hehe. YOU WISH 🤪";

    // Make YES pound so he must click it
    yesBtn.classList.add("pound");

    // Swap background GIF to the rage one (must exist)
    if (questionBgImg) questionBgImg.src = "./assets/question/bg2.gif";
  }
}

function onYesClick() {
  showScreen("schedule");
}

if (noBtn) noBtn.addEventListener("click", onNoClick);
if (yesBtn) yesBtn.addEventListener("click", onYesClick);

// When question screen becomes visible, apply styling
// (We call it when we show screen, but we don't have hooks; easiest: run once now and again after cover transition.)
ensureQuestionStylingOnce();

// ============================================
// SCHEDULE -> GIFT (unchanged)
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
// RESTART (reset everything)
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
    noBtn.classList.remove("noBtn", "btnTextStroke");
  }
  if (yesBtn) {
    yesBtn.style.transform = "";
    yesBtn.classList.remove("yesBtn", "btnTextStroke", "pound");
    yesBtn.style.removeProperty("--scale");
  }

  if (noCounter) noCounter.innerHTML = "";

  if (questionBgImg) questionBgImg.src = "./assets/question/bg.gif";

  if (letterGif) letterGif.src = "./assets/cover/Letter_Flying.gif";
  if (letterStack) letterStack.classList.remove("zooming");
  if (parallaxArea) parallaxArea.classList.remove("zooming");
  if (sparkles) sparkles.innerHTML = "";

  targetX = 0; targetY = 0; curX = 0; curY = 0;

  // Remove styled flag so it re-renders nicely
  const titleEl = document.querySelector(`#${screens.question} .scribbleTitle`);
  if (titleEl) {
    delete titleEl.dataset.styled;
    titleEl.classList.remove("strokeText");
    titleEl.textContent = "Will you be my valentine?";
  }

  showScreen("password");
}

if (restartBtn) restartBtn.addEventListener("click", resetAll);
