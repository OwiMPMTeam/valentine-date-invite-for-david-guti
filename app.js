const $ = (id) => document.getElementById(id);

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id)?.classList.add("active");
}

/* =========================
   AUDIO
========================= */
const sparkleSfx = $("sparkleSfx");
const bgMusic = $("bgMusic");

// NEW
const noLastClickSfx = new Audio("./assets/audio/no-last-click.mp3");
noLastClickSfx.preload = "auto";

const rosesSfx = new Audio("./assets/audio/roses-appear.mp3");
rosesSfx.preload = "auto";

let bgStarted = false;

function tryStartBgMusic(){
  if (bgStarted || !bgMusic) return;
  bgStarted = true;
  bgMusic.volume = 0.35;
  bgMusic.play().catch(()=>{});
}
function playSparkleSfx(){
  if (!sparkleSfx) return;
  sparkleSfx.currentTime = 0;
  sparkleSfx.volume = 0.85;
  sparkleSfx.play().catch(()=>{});
}
function playNoLastClickSfx(){
  try{
    noLastClickSfx.currentTime = 0;
    noLastClickSfx.volume = 0.95;
    noLastClickSfx.play().catch(()=>{});
  } catch {}
}
function playRosesSfx(){
  try{
    rosesSfx.currentTime = 0;
    rosesSfx.volume = 0.95;
    rosesSfx.play().catch(()=>{});
  } catch {}
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
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    const res = await DeviceOrientationEvent.requestPermission();
    return res === "granted";
  }
  return true;
}

function enableTilt(){
  tiltEnabled = true;
  window.addEventListener("deviceorientation", (e) => {
    const gamma = e.gamma ?? 0;
    const beta  = e.beta ?? 0;
    tiltX = Math.max(-1, Math.min(1, gamma / 25));
    tiltY = Math.max(-1, Math.min(1, beta / 35));
  }, { passive:true });
}

async function handleTiltEnable(){
  tryStartBgMusic();
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
tiltSkip?.addEventListener("click", () => {
  tryStartBgMusic();
  tiltGate?.classList.add("hidden");
});

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
  tryStartBgMusic();

  const v = pwInput.value || "";
  if (validPw(v)){
    fails = 0;
    setPwMsg("");
    clearGossip();
    showScreen("screen-cover");
    return;
  }

  fails += 1;

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
   SPARKLES (fireworks + fall) + SOUND
========================= */
const sparkles = $("sparkles");

function burstSparkles(){
  if (!sparkles) return;

  playSparkleSfx();

  const symbols = ["✨","⚡️","💫","💕","🏳️‍🌈","💖","✨","⚡️"];
  const sizes = ["s1","s2","s3","s4","s5"];

  sparkles.innerHTML = "";

  const count = 220;
  for (let i=0; i<count; i++){
    const s = document.createElement("div");
    s.className = `spark ${sizes[Math.floor(Math.random()*sizes.length)]}`;
    s.textContent = symbols[Math.floor(Math.random()*symbols.length)];

    const originX = 50 + (Math.random()*10 - 5);
    const originY = 35 + (Math.random()*10 - 5);

    s.style.left = `${originX}%`;
    s.style.top  = `${originY}%`;

    s.style.setProperty("--bx", `${Math.random()*520 - 260}px`);
    s.style.setProperty("--by", `${Math.random()*380 - 190}px`);
    s.style.setProperty("--dx", `${Math.random()*900 - 450}px`);
    s.style.setProperty("--dy", `${Math.random()*520 - 260}px`);

    s.style.animationDelay = `${Math.random()*550}ms`;
    sparkles.appendChild(s);
  }

  setTimeout(() => { sparkles.innerHTML = ""; }, 11500);
}

/* =========================
   Parallax (mouse + touch + tilt)
========================= */
function attachParallax(areaId){
  const area = $(areaId);
  if (!area) return;

  const els = Array.from(area.querySelectorAll(".parallax"));
  if (!els.length) return;

  let tx=0, ty=0, cx=0, cy=0;

  function apply(){
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
  tryStartBgMusic();
  burstSparkles();

  parallaxArea?.classList.add("zooming");
  letterImg.src = "./assets/cover/Letter_Opening.gif";

  setTimeout(() => {
    parallaxArea?.classList.remove("zooming");
    letterImg.src = "./assets/cover/Letter_Flying.gif";
    showScreen("screen-question");
  }, 700);
});

/* =========================
   QUESTION: FIX — only YES grows (not both)
   + play special SFX on final "No" click
========================= */
const yesBtn = $("yesBtn");
const noBtn  = $("noBtn");
const rageLine = $("rageLine");
const qBgImg = $("qBgImg");
const qWrap = $("qWrap");

let noClicks = 0;
const maxClicks = 6;

function updateButtons(){
  // keep NO mostly steady (so it doesn't look like both are growing)
  const noFlex = 1;
  const yesFlex = 1 + (noClicks * 1.35);

  yesBtn.style.flex = `${yesFlex} 1 0%`;
  noBtn.style.flex  = `${noFlex} 1 0%`;

  // YES grows both ways; NO only shrinks a bit
  const yesScaleX = 1 + (noClicks * 0.20);
  const yesScaleY = 1 + (noClicks * 0.12);
  yesBtn.style.transform = `scale(${yesScaleX}, ${yesScaleY})`;

  const noScale = Math.max(0.76, 1 - (noClicks * 0.05));
  noBtn.style.transform = `scale(${noScale})`;

  // UI container grows a bit (question + buttons), NOT background gif
  const uiScale = 1 + (noClicks * 0.03);
  if (qWrap) qWrap.style.transform = `scale(${uiScale})`;

  rageLine.textContent = noClicks > 0 ? `Try me bitch. 😡  ${noClicks} / ${maxClicks}` : "";

  if (noClicks >= maxClicks){
    noBtn.disabled = true;
    qBgImg.src = "./assets/question/bg_final.gif";

    // Pound YES
    yesBtn.animate(
      [
        { transform: `scale(${yesScaleX}, ${yesScaleY})` },
        { transform: `scale(${yesScaleX * 1.07}, ${yesScaleY * 1.08})` },
        { transform: `scale(${yesScaleX}, ${yesScaleY})` },
      ],
      { duration: 650, iterations: Infinity, easing: "ease-in-out" }
    );
  }
}

noBtn?.addEventListener("click", () => {
  tryStartBgMusic();
  if (noBtn.disabled) return;

  noClicks += 1;

  // play special SFX exactly on the last "no" click (when YES hits max)
  if (noClicks === maxClicks){
    playNoLastClickSfx();
  }

  updateButtons();
});

yesBtn?.addEventListener("click", () => {
  tryStartBgMusic();
  showScreen("screen-schedule");
});

updateButtons();

/* =========================
   SCHEDULE -> GIFT
========================= */
$("giftBtn")?.addEventListener("click", () => {
  tryStartBgMusic();
  showScreen("screen-gift");
  buildBouquet();
});

/* =========================
   GIFT: bouquet + SFX on appear
========================= */
const bouquet = $("bouquet");

function buildBouquet(){
  if (!bouquet) return;

  playRosesSfx(); // NEW: sound when bouquet appears

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
  if (qWrap) qWrap.style.transform = "";

  rageLine.textContent = "";

  if (letterImg) letterImg.src = "./assets/cover/Letter_Flying.gif";
  if (bouquet) bouquet.innerHTML = "";

  showScreen("screen-password");
});
