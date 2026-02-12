// ===============================
// Valentine Microsite — app.js
// Password Gate upgrades (per Owi's notes)
// ===============================

// Helpers
const $ = (id) => document.getElementById(id);

function normalizePw(raw) {
  return (raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,]/g, "") // remove dots/commas
    .replace(/(st|nd|rd|th)\b/g, "") // remove ordinal suffix
    .trim();
}

function isValidPassword(input) {
  const v = normalizePw(input);

  // Accept common versions:
  // "october 3", "oct 3", "october 3rd", "oct 3rd"
  // "10/3", "10-3", "10 3", "10.3" (dot removed by normalize)
  const accepted = new Set([
    "october 3",
    "oct 3",
    "october3",
    "oct3",
    "10/3",
    "10-3",
    "10 3",
    "103"
  ]);

  if (accepted.has(v)) return true;

  // Also accept: "october 03" or "10/03"
  if (v === "october 03" || v === "oct 03" || v === "10/03" || v === "10-03") return true;

  // Some people type "october third"
  if (v === "october third" || v === "oct third") return true;

  return false;
}

// Screens
const screens = {
  password: $("screen-password"),
  cover: $("screen-cover"),
  question: $("screen-question"),
  schedule: $("screen-schedule"),
  gift: $("screen-gift"),
};

function showScreen(key) {
  Object.values(screens).forEach((s) => s && s.classList.remove("active"));
  if (screens[key]) screens[key].classList.add("active");
}

// ===============================
// PASSWORD GATE
// ===============================
const pwInput = $("pwInput");
const pwBtn = $("pwBtn");
const pwError = $("pwError");

let pwFails = 0;
let gossipGifEl = null;

function setPwHintUI() {
  // Make it "mysterious" with dots + correct hint copy
  // We’ll add the hint line dynamically if it exists.
  const hintEl = document.querySelector("#screen-password .smallNote");
  if (hintEl) hintEl.textContent = "Hint: Our Love Day 🥰";

  // Make input masked (dots)
  if (pwInput) pwInput.type = "password";
  if (pwInput) pwInput.placeholder = "••• •••";
}

function showPwMessage(msg, isError = true) {
  if (!pwError) return;
  pwError.classList.remove("hidden");
  pwError.textContent = msg;
  pwError.style.color = isError ? "#b8002a" : "rgba(0,0,0,0.75)";
}

function spawnGossipGifRandomly() {
  if (gossipGifEl) return; // already exists

  gossipGifEl = document.createElement("img");
  gossipGifEl.src = "./assets/password/gossip.gif";
  gossipGifEl.alt = "Gossip girl gif";
  gossipGifEl.className = "gossipGif";

  // random position
  const x = Math.random() * 70 + 10; // 10% - 80%
  const y = Math.random() * 55 + 10; // 10% - 65%
  gossipGifEl.style.left = `${x}%`;
  gossipGifEl.style.top = `${y}%`;

  // random rotation + scale a bit
  const rot = (Math.random() * 18) - 9; // -9..9 deg
  const sc = (Math.random() * 0.25) + 0.9; // 0.9..1.15
  gossipGifEl.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${sc})`;

  // append to password screen
  const screen = screens.password;
  if (screen) screen.appendChild(gossipGifEl);
}

function handlePasswordSubmit() {
  const val = pwInput ? pwInput.value : "";

  if (isValidPassword(val)) {
    // success
    if (pwError) pwError.classList.add("hidden");
    showScreen("cover");
    return;
  }

  pwFails += 1;

  if (pwFails === 1) {
    showPwMessage("Nope 😼 try again.");
    return;
  }

  if (pwFails === 2) {
    showPwMessage('Hint: “Gossip Girls: asked him for the weather”');
    spawnGossipGifRandomly();
    return;
  }

  // 3rd fail and beyond: give answer
  showPwMessage("It’s 'October 3' 🙄 girl… come on", false);
}

if (pwBtn) pwBtn.addEventListener("click", handlePasswordSubmit);
if (pwInput) {
  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handlePasswordSubmit();
  });
}

setPwHintUI();

// ===============================
// KEEP YOUR EXISTING FLOW HOOKS
// (If these IDs exist, we keep things working)
// ===============================

const letterStack = $("letterStack");
if (letterStack) {
  const goToQuestion = () => {
    letterStack.classList.add("opening");
    setTimeout(() => {
      showScreen("question");
      letterStack.classList.remove("opening");
    }, 650);
  };

  letterStack.addEventListener("click", goToQuestion);
  letterStack.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") goToQuestion();
  });
}

// No/Yes logic (keeps your idea intact; your existing version may be more complex)
const yesBtn = $("yesBtn");
const noBtn = $("noBtn");
const noCounter = $("noCounter");

let noClicks = 0;

function updateNoYesSizes() {
  if (!yesBtn || !noBtn) return;

  // Make "no" smaller and "yes" bigger with each click
  const yesScale = 1 + (noClicks * 0.18);
  const noScale = Math.max(0.55, 1 - (noClicks * 0.10));

  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform = `scale(${noScale})`;

  if (noCounter) noCounter.textContent = noClicks >= 6 ? "" : `Wrong answer attempts: ${noClicks} 😈`;

  if (noClicks >= 6) {
    noBtn.disabled = true;
    noBtn.textContent = "Nope. Not an option 😌";
    yesBtn.style.transform = "scale(2.2)";
  }
}

if (noBtn) {
  noBtn.addEventListener("click", () => {
    noClicks += 1;
    updateNoYesSizes();

    // swap bg gif after 6 clicks if file exists (optional)
    const bg = $("questionBgImg");
    if (bg && noClicks >= 6) {
      bg.src = "./assets/question/bg2.gif"; // optional, add later
    }
  });
}

if (yesBtn) {
  yesBtn.addEventListener("click", () => {
    showScreen("schedule");
  });
}

// Gift button
const giftBtn = $("giftBtn");
const restartBtn = $("restartBtn");

if (giftBtn) {
  giftBtn.addEventListener("click", () => {
    showScreen("gift");

    // generate roses (simple placeholder grid)
    const roseField = $("roseField");
    if (roseField) {
      roseField.innerHTML = "";
      for (let i = 0; i < 24; i++) {
        const d = document.createElement("div");
        d.className = "rose";
        d.innerHTML = "🌹";
        roseField.appendChild(d);
      }
    }
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    // reset everything
    pwFails = 0;
    noClicks = 0;
    if (pwInput) pwInput.value = "";
    if (pwError) pwError.classList.add("hidden");
    if (gossipGifEl) {
      gossipGifEl.remove();
      gossipGifEl = null;
    }
    if (noBtn) {
      noBtn.disabled = false;
      noBtn.textContent = "Hell nah, Keysha!";
      noBtn.style.transform = "";
    }
    if (yesBtn) yesBtn.style.transform = "";
    if (noCounter) noCounter.textContent = "";
    showScreen("password");
  });
}
