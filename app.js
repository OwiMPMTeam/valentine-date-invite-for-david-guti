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
// COVER: Parallax (strong)
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

  setInterval(() => {
    targetX = clamp(targetX + (Math.random() * 0.22 - 0.11), -0.8, 0.8);
    targetY = clamp(targetY + (Math.random() * 0.22 - 0.11), -0.8, 0.8);
  }, 1800);
})();

// ============================================
// SPARKLES (MORE + LONGER + FALL + persist across next screen)
// ============================================

const sparkles = $("sparkles");

function burstSparkles() {
  if (!sparkles) return;

  const symbols = ["✨","⚡️","💫","💕","💞","🏳️‍🌈","✨","⚡️","💫","🏳️‍🌈","✨","💖"];
  const sizes = ["s1","s2","s3","s4","s5"];

  // don't clear immediately; let them live
  sparkles.innerHTML = "";

  const count = 70; // MORE!

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = `spark ${sizes[Math.floor(Math.random() * sizes.length)]}`;
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    // spawn across a wide field
    const cx = Math.random() * 110 - 5; // -5%..105%
    const cy = Math.random() * 70 + 5;  // 5%..75%
    s.style.left = `${cx}%`;
    s.style.top = `${cy}%`;

    // drift + fall
    const dx = (Math.random() * 520 - 260).toFixed(0) + "px";
    const dy = (Math.random() * 300 - 140).toFixed(0) + "px";
    s.style.setProperty("--dx", dx);
    s.style.setProperty("--dy", dy);

    // stagger
    s.style.animationDelay = `${Math.random() * 900}ms`;

    sparkles.appendChild(s);
  }

  // clear after they finish (matches CSS 4200ms + delay up to 900ms)
  setTimeout(() => { sparkles.innerHTML = ""; }, 5600);
}

// ============================================
// COVER: Letter click
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
    if (questionBgImg) questionBgImg.src = "./assets/question/bg2.gif";
  }
}

if (noBtn) noBtn.addEventListener("click", () => { noClicks += 1; updateNoYesSizes(); });
if (yesBtn) yesBtn.addEventListener("click", () => showScreen("schedule"));

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

  targetX = 0; targetY = 0; curX = 0; curY = 0;

  showScreen("password");
}

if (restartBtn) restartBtn.addEventListener("click", resetAll);
