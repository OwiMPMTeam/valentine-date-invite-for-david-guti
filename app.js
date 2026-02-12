const $ = (id) => document.getElementById(id);

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id)?.classList.add("active");
}

/* =========================
   Tilt Permission Gate (iOS requires a tap)
========================= */
const tiltGate = $("tiltGate");
const tiltBtn = $("tiltBtn");
const tiltSkip = $("tiltSkip");

let tiltEnabled = false;
let tiltX = 0, tiltY = 0;

async function requestTiltPermission(){
  // iOS Safari requires requestPermission()
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    const res = await DeviceOrientationEvent.requestPermission();
    return res === "granted";
  }
  // non-iOS browsers: no permission needed
  return true;
}

function enableTilt(){
  tiltEnabled = true;
  window.addEventListener("deviceorientation", (e) => {
    // gamma: left-right, beta: front-back
    const gamma = e.gamma ?? 0; // -90..90
    const beta  = e.beta ?? 0;  // -180..180
    tiltX = Math.max(-1, Math.min(1, gamma / 25));
    tiltY = Math.max(-1, Math.min(1, beta / 35));
  }, { passive:true });
}

async function handleTiltEnable(){
  try{
    const ok = await requestTiltPermission();
    if (ok) enableTilt();
  } catch(e) {
    // ignore
  } finally {
    tiltGate?.classList.add("hidden");
  }
}

tiltBtn?.addEventListener("click", handleTiltEnable);
tiltSkip?.addEventListener("click", () => tiltGate?.classList.add("hidden"));

/* =========================
   PASSWORD
========================= */
const pwInput = $("pwInput");
const pwBtn = $("pwBtn");
const pwMsg = $("pwMsg");
const pwGossip = $("pwGossip");

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

function setPwMsg(text){ pwMsg.textContent = text || ""; }

function showGossipNearInput(){
  if (!pwGossip) return;
  pwGossip.innerHTML = "";
  const img = document.createElement("img");
  img.src = "./assets/password/gossip.gif";
  img.alt = "gossip";
  pwGossip.appendChild(img);
}

function clearGossip(){
  if (!pwGossip) return;
  pwGossip.innerHTML = "";
}

function submitPw(){
  const v = pwInput.value || "";
  if (validPw(v)){
    fails = 0;
    setPwMsg("");
    clearGossip();
    showScreen("screen-cover");
    return;
  }

  fails += 1;

  // 3 tries until GIF + final hint
  if (fails === 1){
    setPwMsg("Nope 😼 try again.");
  } else if (fails === 2){
    setPwMsg("Nope. Again 😇");
  } else if (fails === 3){
    setPwMsg("Mean Girls: He asked her for the weather!");
    showGossipNearInput();
  } else {
    setPwMsg("Girl... It is October 3 🙄");
    showGossipNearInput();
  }
}

pwBtn?.addEventListener("click", submitPw);
pwInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") submitPw(); });

/* =========================
   SPARKLES (fireworks + fall)
========================= */
const sparkles = $("sparkles");

function burstSparkles(){
  if (!sparkles) return;
  const symbols = ["✨","⚡️","💫","💕","🏳️‍🌈","💖","✨","⚡️"];
  const sizes = ["s1","s2","s3","s4","s5"];

  sparkles.innerHTML = "";

  const count = 220; // cover the screen
  for (let i=0; i<count; i++){
    const s = document.createElement("div");
    s.className = `spark ${sizes[Math.floor(Math.random()*sizes.length)]}`;
    s.textContent = symbols[Math.floor(Math.random()*symbols.length)];

    // Boom origin near the letter (center-ish)
    const originX = 50 + (Math.random()*10 - 5);
    const originY = 35 + (Math.random()*10 - 5);

    s.style.left = `${originX}%`;
    s.style.top  = `${originY}%`;

    // boom vectors
    s.style.setProperty("--bx", `${Math.random()*520 - 260}px`);
    s.style.setProperty("--by", `${Math.random()*380 - 190}px`);

    // drift vectors
    s.style.setProperty("--dx", `${Math.random()*900 - 450}px`);
    s.style.setProperty("--dy", `${Math.random()*520 - 260}px`);

    s.style.animationDelay = `${Math.random()*550}ms`;
    sparkles.appendChild(s);
  }

  // keep them visible into next screen
  setTimeout(() => { sparkles.innerHTML = ""; }, 11500);
}

/* =========================
   Parallax (mouse + tilt)
   Works for cover + schedule
========================= */
function attachParallax(areaId){
  const area = $(areaId);
  if (!area) return;

  const els = Array.from(area.querySelectorAll(".parallax"));
  if (!els.length) return;

  let tx=0, ty=0, cx=0, cy=0;

  function apply(){
    // blend mouse/touch + tilt
    const mx = cx + (tiltEnabled ? tiltX * 0.35 : 0);
    const my = cy + (tiltEnabled ? tiltY * 0.35 : 0);

    els.forEach(el => {
      const depth = Number(el.dataset.depth || "16");
      const rot = Number(el.dataset.rot || "0");
      const dx = mx * depth;
      const dy = my * depth;
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    });
  }

  function loop(){
    cx += (tx - cx) * 0.10;
    cy += (ty - cy) * 0.10;
    apply();
    requestAnimationFrame(loop);
  }

  area.addEventListener("mousemove", (e) => {
    const r = area.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    tx = Math.max(-1, Math.min(1, nx)) * 0.9;
    ty = Math.max(-1, Math.min(1, ny)) * 0.9;
  }, { passive:true });

  area.addEventListener("mouseleave", () => { tx = 0; ty = 0; }, { passive:true });

  area.addEventListener("touchmove", (e) => {
    if (!e.touches || !e.touches[0]) return;
    const r = area.getBoundingClientRect();
    const nx = ((e.touches[0].clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.touches[0].clientY - r.top) / r.height) * 2 - 1;
    tx = Math.max(-1, Math.min(1, nx)) * 0.9;
    ty = Math.max(-1, Math.min(1, ny)) * 0.9;
  }, { passive:true });

  requestAnimationFrame(loop);
}

attachParallax("parallaxArea");
attachParallax("scheduleParallaxArea");

/* =========================
   COVER click -> rapid zoom + swap gif
========================= */
const letterBtn = $("letterBtn");
const letterImg = $("letterImg");
const parallaxArea = $("parallaxArea");

letterBtn?.addEventListener("click", () => {
  burstSparkles();

  // rapid zoom moment
  parallaxArea?.classList.add("zooming");

  letterImg.src = "./assets/cover/Letter_Opening.gif";
  setTimeout(() => {
    parallaxArea?.classList.remove("zooming");
    letterImg.src = "./assets/cover/Letter_Flying.gif";
    showScreen("screen-question");
  }, 700);
});

/* =========================
   QUESTION (grow YES to ~1/8 page width after 6 clicks)
========================= */
const yesBtn = $("yesBtn");
const noBtn  = $("noBtn");
const rageLine = $("rageLine");
const qBgImg = $("qBgImg");
const btnRow = $("btnRow");

let noClicks = 0;
const maxClicks = 6;

function updateButtons(){
  // Use flex-grow so they resize next to each other (no overlap)
  const yesGrow = 1 + (noClicks * 1.15);  // yes gets BIG
  const noGrow  = Math.max(0.35, 1 - (noClicks * 0.12)); // no gets smaller

  yesBtn.style.flex = `${yesGrow} 1 0%`;
  noBtn.style.flex  = `${noGrow} 1 0%`;

  // Also scale slightly for drama, but still side-by-side
  const yesScale = 1 + (noClicks * 0.14);
  const noScale  = Math.max(0.72, 1 - (noClicks * 0.06));
  yesBtn.style.transform = `scale(${yesScale})`;
  noBtn.style.transform  = `scale(${noScale})`;

  rageLine.textContent = noClicks > 0 ? `Try me bitch. 😡  ${noClicks} / ${maxClicks}` : "";

  if (noClicks >= maxClicks){
    noBtn.disabled = true;
    qBgImg.src = "./assets/question/bg_final.gif";

    // Pound YES
    yesBtn.animate(
      [
        { transform: `scale(${yesScale})` },
        { transform: `scale(${yesScale * 1.08})` },
        { transform: `scale(${yesScale})` },
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
  buildBouquet(); // DO NOT CHANGE THIS (you love it)
});

/* =========================
   GIFT: emoji bouquet (slightly bigger)
========================= */
const bouquet = $("bouquet");

function buildBouquet(){
  if (!bouquet) return;
  bouquet.innerHTML = "";

  const coords = [
    [50,16],[44,18],[56,18],[39,22],[61,22],[33,28],[67,28],
    [28,36],[72,36],[24,46],[76,46],[30,54],[70,54],
    [36,60],[64,60],[42,64],[58,64],[48,66],[52,66],
    [46,70],[54,70],[50,73],[45,76],[55,76],[50,80]
  ];

  const extra = 22;
  for (let i=0; i<coords.length + extra; i++){
    const el = document.createElement("div");
    el.className = "rose";
    el.textContent = "🌹";

    let x, y;
    if (i < coords.length){
      [x,y] = coords[i];
    } else {
      x = 50 + (Math.random()*30 - 15);
      y = 50 + (Math.random()*44 - 22);
    }

    // slightly bigger overall
    const size = 36 + Math.random()*42;
    el.style.left = `${x}%`;
    el.style.top  = `${y}%`;
    el.style.fontSize = `${size}px`;
    el.style.animationDelay = `${i * 38}ms`;

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
  clearGossip();
  if (sparkles) sparkles.innerHTML = "";

  qBgImg.src = "./assets/question/bg.gif";
  noBtn.disabled = false;

  yesBtn.style.flex = "1 1 0%";
  noBtn.style.flex  = "1 1 0%";
  yesBtn.style.transform = "";
  noBtn.style.transform = "";

  rageLine.textContent = "";

  if (letterImg) letterImg.src = "./assets/cover/Letter_Flying.gif";
  if (bouquet) bouquet.innerHTML = "";

  showScreen("screen-password");
});
