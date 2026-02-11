const screens = {
  password: document.getElementById("screen-password"),
  cover: document.getElementById("screen-cover"),
  question: document.getElementById("screen-question"),
  schedule: document.getElementById("screen-schedule"),
  gift: document.getElementById("screen-gift"),
};

function showScreen(name){
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  screens[name].classList.add("fadeIn");
  setTimeout(() => screens[name].classList.remove("fadeIn"), 350);
}

// ---------- Password Gate ----------
const pwInput = document.getElementById("pwInput");
const pwBtn = document.getElementById("pwBtn");
const pwError = document.getElementById("pwError");

function checkPassword(){
  const v = (pwInput.value || "").trim().toLowerCase();
  if (v === "our love day"){
    pwError.classList.add("hidden");
    showScreen("cover");
  } else {
    pwError.classList.remove("hidden");
  }
}
pwBtn.addEventListener("click", checkPassword);
pwInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkPassword();
});

// ---------- Cover Parallax + Letter Open ----------
const parallaxArea = document.getElementById("parallaxArea");
const parallaxEls = document.querySelectorAll(".parallax");
const letterStack = document.getElementById("letterStack");

function handleParallax(e){
  const rect = parallaxArea.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / rect.width;  // -0.5..0.5-ish
  const dy = (e.clientY - cy) / rect.height;

  parallaxEls.forEach(el => {
    const depth = Number(el.dataset.depth || 8);
    const tx = dx * depth * 10;
    const ty = dy * depth * 10;
    el.style.transform = `${el.style.transform.split(" translate(")[0]} translate(${tx}px, ${ty}px)`;
  });
}

parallaxArea.addEventListener("mousemove", handleParallax);
parallaxArea.addEventListener("mouseleave", () => {
  parallaxEls.forEach(el => { el.style.transform = el.style.transform.split(" translate(")[0]; });
});

function openLetter(){
  letterStack.classList.add("opening");

  // little “zoom all graphics” vibe by scaling the whole cover area
  parallaxArea.style.transform = "scale(1.02)";
  parallaxArea.style.transition = "transform .45s ease";

  setTimeout(() => {
    parallaxArea.style.transform = "scale(1.00)";
    showScreen("question");
  }, 520);
}
letterStack.addEventListener("click", openLetter);
letterStack.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openLetter(); });

// ---------- “Hell nah” mechanic ----------
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const noCounter = document.getElementById("noCounter");
const questionBgImg = document.getElementById("questionBgImg");

const BG_DEFAULT = "./assets/question/bg.gif";
const BG_FINAL = "./assets/question/bg_final.gif";

let noClicks = 0;

function resetQuestion(){
  noClicks = 0;
  yesBtn.style.transform = "scale(1)";
  yesBtn.style.width = "";
  yesBtn.style.fontSize = "";
  yesBtn.style.padding = "";
  noBtn.style.transform = "scale(1)";
  noBtn.style.opacity = "0.92";
  noBtn.disabled = false;
  noBtn.textContent = "Hell nah, Keysha!";
  questionBgImg.src = BG_DEFAULT;
  noCounter.textContent = "";
}

function handleNoClick(){
  noClicks += 1;

  // Yes grows, No shrinks
  const yesScale = 1 + noClicks * 0.22;
  const noScale = Math.max(0.65, 1 - noClicks * 0.08);

  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform = `scale(${noScale})`;

  noCounter.textContent = noClicks < 6 ? `😼 ok ok… try again (${noClicks}/6)` : "";

  // On 6th click: swap GIF + disable No
  if (noClicks >= 6){
    questionBgImg.src = BG_FINAL;

    noBtn.disabled = true;
    noBtn.style.opacity = "0.3";
    noBtn.textContent = "nope 😈";

    // Make YES basically take over
    yesBtn.style.width = "min(560px, 92vw)";
    yesBtn.style.fontSize = "34px";
    yesBtn.style.padding = "18px 22px";
  }
}

noBtn.addEventListener("click", handleNoClick);

yesBtn.addEventListener("click", () => {
  showScreen("schedule");
});

// ---------- Schedule → Gift ----------
const giftBtn = document.getElementById("giftBtn");
giftBtn.addEventListener("click", () => {
  showScreen("gift");
  drawRoses();
});

// ---------- Roses (scribble SVG) ----------
const roseField = document.getElementById("roseField");
let rosesDrawn = false;

function roseSVG(){
  // Simple scribbly rose-ish lines (cute > realistic)
  return `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <path class="path" d="M60 95
      C45 90, 35 78, 40 63
      C44 50, 58 48, 60 58
      C62 48, 76 50, 80 63
      C85 78, 75 90, 60 95
      M60 58
      C52 56, 50 47, 57 44
      C64 41, 70 48, 64 53
      C61 56, 58 56, 60 58
      M60 95
      C58 102, 56 108, 54 114
      M60 95
      C62 102, 64 108, 66 114
    " />
  </svg>`;
}

function drawRoses(){
  if (rosesDrawn) return;
  rosesDrawn = true;

  const count = 36; // “3 dozens”
  roseField.innerHTML = "";

  for (let i=0; i<count; i++){
    const div = document.createElement("div");
    div.className = "rose";
    div.innerHTML = roseSVG();
    roseField.appendChild(div);
  }
}

// ---------- Restart ----------
const restartBtn = document.getElementById("restartBtn");
restartBtn.addEventListener("click", () => {
  rosesDrawn = false;
  roseField.innerHTML = "";
  resetQuestion();
  pwInput.value = "";
  showScreen("password");
});

// Start state
resetQuestion();
showScreen("password");
