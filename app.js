// ============================================
// Valentine Microsite — app.js (FULL)
// ============================================

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);

function showOnly(screenId) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const el = $(screenId);
  if (el) el.classList.add("active");
}

// ---------- Screens ----------
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
// PASSWORD GATE (October 3 variants + escalating hints)
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

  // Accept combinations:
  // October 3 / October 3rd / Oct 3 / 10/3 / 10-3 / 10.3 / 10 3 / 103
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

function setPwHintUI() {
  const hintEl = document.querySelector("#screen-password .smallNote");
  if (hintEl) hintEl.textContent = "Our Love Day";

  if (pwInput) {
    pwInput.type = "password"; // dots
    pwInput.placeholder = "••• •••";
  }
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
  // Appears behind content, 3x bigger
  if (gossipGifEl) return;

  gossipGifEl = document.createElement("img");
  gossipGifEl.src = "./assets/password/gossip.gif"; // add this file when you have it
  gossipGifEl.alt = "Gossip girl gif";
  gossipGifEl.className = "gossipGif";

  // Random position
  const x = Math.random() * 70 + 15; // 15% - 85%
  const y = Math.random() * 55 + 18; // 18% - 73%
  gossipGifEl.style.left = `${x}%`;
  gossipGifEl.style.top = `${y}%`;

  // Random rotation + small scale variation
  const rot = (Math.random() * 10) - 5; // -5..5 deg
  const sc = (Math.random() * 0.18) + 0.95; // 0.95..1.13
  gossipGifEl.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${sc})`;

  // Prepend ensures it's earlier in DOM (under content)
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
    showPwMessage('Hint: “Mean Girls: She asked him for the weather”', "error");
    spawnGossipGifRandomly();
    return;
  }

  // 3rd fail+
  showPwMessage("It’s October 3 🙄 girl… come on", "soft");
}

if (pwBtn) pwBtn.addEventListener("click", handlePasswordSubmit);
if (pwInput) {
  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handlePasswordSubmit();
  });
}
setPwHintUI();

// ============================================
// INVITATION SCREEN (Letter_Flying -> Letter_Opening + fun zoom)
// ============================================

const letterStack = $("letterStack");
const letterGif = $("letterGif");

function goToQuestionFromCover() {
  if (!letterStack || !letterGif) return;

  // swap to opening gif
  letterGif.src = "./assets/cover/Letter_Opening.gif";

  // add zoom animation class
  letterStack.classList.add("zooming");

  // after zoom ends, go to question
  setTimeout(() => {
    // reset for replay
    letterGif.src = "./assets/cover/Letter_Flying.gif";
    letterStack.classList.remove("zooming");

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
// Smooth Parallax (less jumpy)
// Moves elements gently based on cursor / touch
// ============================================

(function setupParallax() {
  const area = $("parallaxArea");
  if (!area) return;

  const items = Array.from(area.querySelectorAll(".parallax"));
  if (!items.length) return;

  let targetX = 0, targetY = 0;
  let curX = 0, curY = 0;

  const lerp = (a, b, t) => a + (b - a) * t;

  function onMove(clientX, clientY) {
    const r = area.getBoundingClientRect();
    const nx = ((clientX - r.left) / r.width) * 2 - 1;   // -1..1
    const ny = ((clientY - r.top) / r.height) * 2 - 1;  // -1..1
    targetX = nx;
    targetY = ny;
  }

  area.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });

  area.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  function animate() {
    curX = lerp(curX, targetX, 0.08);
    curY = lerp(curY, targetY, 0.08);

    items.forEach((el) => {
      const depth = Number(el.dataset.depth || "8");
      const dx = curX * depth;
      const dy = curY * depth;

      // keep existing rotation if any
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    });

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// ============================================
// QUESTION SCREEN (Hell nah shrinks, Yes grows, lock after 6)
// ============================================

const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const noCounter = $("noCounter");
const questionBgImg = $("questionBgImg");

let noClicks = 0;

function updateNoYesSizes() {
  if (!yesBtn || !noBtn) return;

  // yes gets bigger, no gets smaller
  const yesScale = 1 + (noClicks * 0.18);
  const noScale = Math.max(0.55, 1 - (noClicks * 0.10));

  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform = `scale(${noScale})`;

  if (noCounter) {
    if (noClicks < 6) noCounter.textContent = "";
    else noCounter.textContent = "";
  }

  if (noClicks >= 6) {
    noBtn.disabled = true;
    noBtn.textContent = "Nope. Not an option 😌";
    yesBtn.style.transform = "scale(2.2)";

    // optional: swap bg gif if you add it later
    if (questionBgImg) {
      questionBgImg.src = "./assets/question/bg2.gif";
    }
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

    // Simple rose field (emoji placeholders)
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
  if (noCounter) noCounter.textContent = "";

  if (questionBgImg) questionBgImg.src = "./assets/question/bg.gif";

  if (letterGif) letterGif.src = "./assets/cover/Letter_Flying.gif";
  if (letterStack) letterStack.classList.remove("zooming");

  showScreen("password");
}

if (restartBtn) restartBtn.addEventListener("click", resetAll);
