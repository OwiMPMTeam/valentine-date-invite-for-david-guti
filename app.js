// ===== helpers =====
const $ = (id) => document.getElementById(id);

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id)?.classList.add("active");
}

// ===== password gate =====
const pwInput = $("pwInput");
const pwBtn = $("pwBtn");
const pwMsg = $("pwMsg");
const pwBg = $("pwBg");

let fails = 0;

function norm(s){
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,]/g, "")
    .replace(/(st|nd|rd|th)\b/g, "")
    .trim();
}
function validPw(s){
  const v = norm(s);
  const ok = new Set([
    "october 3","oct 3","october3","oct3",
    "10/3","10-3","10 3","103",
    "10/03","10-03","10 03",
  ]);
  return ok.has(v);
}

function setPwMsg(text){
  pwMsg.textContent = text;
}

function showGossipBehind(){
  if (!pwBg) return;
  pwBg.innerHTML = "";
  const img = document.createElement("img");
  img.src = "./assets/password/gossip.gif";
  img.alt = "gossip";
  pwBg.appendChild(img);
}

function submitPw(){
  const v = pwInput.value || "";
  if (validPw(v)){
    fails = 0;
    setPwMsg("");
    if (pwBg) pwBg.innerHTML = "";
    showScreen("screen-cover");
    return;
  }

  fails += 1;
  if (fails === 1){
    setPwMsg("Nope 😼 try again.");
  } else if (fails === 2){
    setPwMsg("Hint: Gossip Girls asked him for the weather.");
    showGossipBehind();
  } else {
    setPwMsg("It’s October 3 🙄 girl… come on");
  }
}

pwBtn?.addEventListener("click", submitPw);
pwInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") submitPw(); });

// ===== sparkles =====
const sparkles = $("sparkles");

function burstSparkles(){
  if (!sparkles) return;

  const symbols = ["✨","⚡️","💫","💕","🏳️‍🌈","💖","✨","⚡️"];
  const sizes = ["s1","s2","s3","s4","s5"];

  sparkles.innerHTML = "";

  const count = 120; // MORE
  for (let i=0; i<count; i++){
    const s = document.createElement("div");
    s.className = `spark ${sizes[Math.floor(Math.random()*sizes.length)]}`;
    s.textContent = symbols[Math.floor(Math.random()*symbols.length)];

    s.style.left = `${Math.random()*120 - 10}%`;
    s.style.top  = `${Math.random()*85}%`;

    s.style.setProperty("--dx", `${Math.random()*900 - 450}px`);
    s.style.setProperty("--dy", `${Math.random()*520 - 260}px`);

    s.style.animationDelay = `${Math.random()*1800}ms`;
    sparkles.appendChild(s);
  }

  // persist into next screen, fade slowly
  setTimeout(() => { sparkles.innerHTML = ""; }, 11500);
}

// ===== cover screen =====
const letterBtn = $("letterBtn");
const letterImg = $("letterImg");

letterBtn?.addEventListener("click", () => {
  if (!letterImg) return;

  burstSparkles();
  letterImg.src = "./assets/cover/Letter_Opening.gif";

  // quick “pop”
  letterBtn.style.transform = "translateY(-2px) scale(1.04)";
  setTimeout(() => { letterBtn.style.transform = ""; }, 220);

  setTimeout(() => {
    letterImg.src = "./assets/cover/Letter_Flying.gif";
    showScreen("screen-question");
  }, 700);
});

// ===== parallax (hover-ish effect) =====
const parallaxArea = $("parallaxArea");
const parallaxEls = parallaxArea ? Array.from(parallaxArea.querySelectorAll(".parallax")) : [];

let tx=0, ty=0, cx=0, cy=0;

function applyParallax(){
  parallaxEls.forEach(el => {
    const depth = Number(el.dataset.depth || "16");
    const dx = cx * depth;
    const dy = cy * depth;
    const base = el.style.transform || "";
    // NOTE: base already has rotation from CSS; we override transform here safely:
    const rot = getComputedStyle(el).transform === "none" ? "" : "";
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  });
}

function loop(){
  cx += (tx - cx) * 0.10;
  cy += (ty - cy) * 0.10;
  applyParallax();
  requestAnimationFrame(loop);
}
if (parallaxArea && parallaxEls.length){
  parallaxArea.addEventListener("mousemove", (e) => {
    const r = parallaxArea.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    tx = Math.max(-1, Math.min(1, nx)) * 0.9;
    ty = Math.max(-1, Math.min(1, ny)) * 0.9;
  }, { passive:true });

  parallaxArea.addEventListener("mouseleave", () => { tx = 0; ty = 0; }, { passive:true });

  // mobile touch parallax
  parallaxArea.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    const r = parallaxArea.getBoundingClientRect();
    const nx = ((e.touches[0].clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.touches[0].clientY - r.top) / r.height) * 2 - 1;
    tx = Math.max(-1, Math.min(1, nx)) * 0.9;
    ty = Math.max(-1, Math.min(1, ny)) * 0.9;
  }, { passive:true });

  requestAnimationFrame(loop);
}

// ===== question screen logic =====
const yesBtn = $("yesBtn");
const noBtn  = $("noBtn");
const rageLine = $("rageLine");
const qBgImg = $("qBgImg");

let noClicks = 0;
const maxClicks = 6;

function updateButtons(){
  if (!yesBtn || !noBtn) return;

  // yes grows, no shrinks — USING TRANSFORM so layout doesn't break
  const yesScale = 1 + noClicks * 0.22;
  const noScale  = Math.max(0.55, 1 - noClicks * 0.11);

  // keep them close: nudge both to the right together a tiny bit
  const nudge = Math.min(22, noClicks * 4);
  yesBtn.style.transform = `translateX(${nudge}px) scale(${yesScale})`;
  noBtn.style.transform  = `translateX(${nudge}px) scale(${noScale})`;

  if (noClicks > 0){
    rageLine.textContent = `Try me bitch. 😡  ${noClicks} / ${maxClicks}`;
  } else {
    rageLine.textContent = "";
  }

  if (noClicks >= maxClicks){
    noBtn.disabled = true;
    // keep outline color but change label
    noBtn.innerHTML = `<span class="btnStroke">Hehe. YOU WISH 🤪</span>`;
    if (qBgImg) qBgImg.src = "./assets/question/bg_final.gif";

    // make YES “pound”
    yesBtn.style.animation = "pound .65s ease-in-out infinite";
    yesBtn.style.setProperty("--poundScale", `${yesScale}`);
  }
}

noBtn?.addEventListener("click", () => {
  if (noBtn.disabled) return;
  noClicks += 1;
  updateButtons();
});

yesBtn?.addEventListener("click", () => {
  showScreen("screen-schedule");
});

// pound animation injected via JS needs keyframes:
const style = document.createElement("style");
style.textContent = `
@keyframes pound{
  0%,100%{ transform: translateX(0px) scale(var(--poundScale, 1)); }
  50%{ transform: translateX(0px) scale(calc(var(--poundScale, 1) * 1.06)); }
}`;
document.head.appendChild(style);

// init
updateButtons();

// ===== schedule -> gift =====
$("giftBtn")?.addEventListener("click", () => {
  showScreen("screen-gift");
});

// ===== restart =====
$("restartBtn")?.addEventListener("click", () => {
  // reset everything
  fails = 0;
  noClicks = 0;
  if (pwInput) pwInput.value = "";
  setPwMsg("");
  if (pwBg) pwBg.innerHTML = "";
  if (sparkles) sparkles.innerHTML = "";

  if (qBgImg) qBgImg.src = "./assets/question/bg.gif";
  if (noBtn){
    noBtn.disabled = false;
    noBtn.innerHTML = `<span class="btnStroke">Hell nah, Keysha!</span>`;
    noBtn.style.transform = "";
  }
  if (yesBtn){
    yesBtn.style.animation = "";
    yesBtn.style.transform = "";
    yesBtn.style.removeProperty("--poundScale");
  }
  if (rageLine) rageLine.textContent = "";
  if (letterImg) letterImg.src = "./assets/cover/Letter_Flying.gif";

  showScreen("screen-password");
});
