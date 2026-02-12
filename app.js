const $ = (id) => document.getElementById(id);

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id)?.classList.add("active");
}

/* =========================
   PASSWORD
========================= */
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
  pwMsg.textContent = text || "";
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

/* =========================
   SPARKLES
========================= */
const sparkles = $("sparkles");

function burstSparkles(){
  if (!sparkles) return;
  const symbols = ["✨","⚡️","💫","💕","🏳️‍🌈","💖","✨","⚡️"];
  const sizes = ["s1","s2","s3","s4","s5"];

  sparkles.innerHTML = "";

  const count = 120;
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

  setTimeout(() => { sparkles.innerHTML = ""; }, 11500);
}

/* =========================
   COVER
========================= */
const letterBtn = $("letterBtn");
const letterImg = $("letterImg");

letterBtn?.addEventListener("click", () => {
  burstSparkles();
  letterImg.src = "./assets/cover/Letter_Opening.gif";
  setTimeout(() => {
    letterImg.src = "./assets/cover/Letter_Flying.gif";
    showScreen("screen-question");
  }, 700);
});

/* Parallax (doesn't break rotations) */
const parallaxArea = $("parallaxArea");
const parallaxEls = parallaxArea ? Array.from(parallaxArea.querySelectorAll(".parallax")) : [];
let tx=0, ty=0, cx=0, cy=0;

function applyParallax(){
  parallaxEls.forEach(el => {
    const depth = Number(el.dataset.depth || "16");
    const rot = Number(el.dataset.rot || "0");
    const dx = cx * depth;
    const dy = cy * depth;
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
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

  requestAnimationFrame(loop);
}

/* =========================
   QUESTION (YES GROWS A LOT)
========================= */
const yesBtn = $("yesBtn");
const noBtn  = $("noBtn");
const rageLine = $("rageLine");
const qBgImg = $("qBgImg");

let noClicks = 0;
const maxClicks = 6;

function updateButtons(){
  // Significant growth
  const yesScale = 1 + noClicks * 0.48;      // BIG growth per click
  const noScale  = Math.max(0.45, 1 - noClicks * 0.14);

  // keep them close and funny
  const nudge = Math.min(26, noClicks * 5);

  yesBtn.style.transform = `translateX(${nudge}px) scale(${yesScale})`;
  noBtn.style.transform  = `translateX(${nudge}px) scale(${noScale})`;

  if (noClicks > 0){
    rageLine.textContent = `Try me bitch. 😡  ${noClicks} / ${maxClicks}`;
  } else {
    rageLine.textContent = "";
  }

  if (noClicks >= maxClicks){
    noBtn.disabled = true;
    noBtn.innerHTML = `<span class="btnStroke">Hehe. YOU WISH 🤪</span>`;
    qBgImg.src = "./assets/question/bg_final.gif";

    // pound YES
    yesBtn.animate(
      [
        { transform: `translateX(${nudge}px) scale(${yesScale})` },
        { transform: `translateX(${nudge}px) scale(${yesScale * 1.06})` },
        { transform: `translateX(${nudge}px) scale(${yesScale})` },
      ],
      { duration: 650, iterations: Infinity, easing: "ease-in-out" }
    );
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

updateButtons();

/* =========================
   SCHEDULE -> GIFT
========================= */
$("giftBtn")?.addEventListener("click", () => {
  showScreen("screen-gift");
  buildBouquet(); // emoji bouquet animation
});

/* =========================
   GIFT: BOUQUET OF ROSES (emoji)
========================= */
const bouquet = $("bouquet");

function buildBouquet(){
  if (!bouquet) return;
  bouquet.innerHTML = "";

  // Bouquet coordinates (percent positions) shaped like a bouquet
  const coords = [
    [50,18],[44,20],[56,20],[39,24],[61,24],[33,30],[67,30],
    [28,38],[72,38],[24,48],[76,48],[30,56],[70,56],
    [36,62],[64,62],[42,66],[58,66],[48,68],[52,68],
    [46,72],[54,72],[50,75],[45,78],[55,78],[50,82]
  ];

  // Add extra roses around for richness
  const extra = 18;
  for (let i=0; i<coords.length + extra; i++){
    const el = document.createElement("div");
    el.className = "rose";
    el.textContent = "🌹";

    let x, y;
    if (i < coords.length){
      [x,y] = coords[i];
    } else {
      // random around bouquet center
      x = 50 + (Math.random()*28 - 14);
      y = 50 + (Math.random()*40 - 20);
    }

    const size = 28 + Math.random()*34; // size variation
    el.style.left = `${x}%`;
    el.style.top  = `${y}%`;
    el.style.fontSize = `${size}px`;
    el.style.animationDelay = `${i * 40}ms`;

    bouquet.appendChild(el);
  }
}

/* =========================
   RESTART
========================= */
$("restartBtn")?.addEventListener("click", () => {
  fails = 0;
  noClicks = 0;

  if (pwInput) pwInput.value = "";
  setPwMsg("");
  if (pwBg) pwBg.innerHTML = "";
  if (sparkles) sparkles.innerHTML = "";

  qBgImg.src = "./assets/question/bg.gif";
  noBtn.disabled = false;
  noBtn.innerHTML = `<span class="btnStroke">Hell nah, Keysha!</span>`;
  yesBtn.style.transform = "";
  noBtn.style.transform = "";
  rageLine.textContent = "";

  if (letterImg) letterImg.src = "./assets/cover/Letter_Flying.gif";
  if (bouquet) bouquet.innerHTML = "";

  showScreen("screen-password");
});
