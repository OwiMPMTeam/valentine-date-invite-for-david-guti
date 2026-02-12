const $ = (id) => document.getElementById(id);

const screens = ["screen-password","screen-cover","screen-question","screen-schedule","screen-gift"];
function showOnly(id){
  screens.forEach(s => $(s)?.classList.remove("active"));
  $(id)?.classList.add("active");
}

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

// ---------- Sparkles ----------
const sparkles = $("sparkles");
function burstSparkles(){
  if(!sparkles) return;

  const symbols = ["✨","⚡️","💫","💕","💞","🏳️‍🌈","💖","✨","✨","💫","⚡️"];
  const sizes = ["s1","s2","s3","s4","s5","s6"];

  sparkles.innerHTML = "";
  const count = 140;

  for(let i=0;i<count;i++){
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

  // fades slowly even on next screen (animation 9s + delay up to 1.8s)
  setTimeout(() => { sparkles.innerHTML = ""; }, 11500);
}

// ---------- Password screen ----------
let pwFails = 0;
const pwInput = $("pwInput");
const pwBtn = $("pwBtn");
const pwError = $("pwError");
const pwGossipHost = $("pwGossipHost");

function showPwError(msg){
  if(!pwError) return;
  pwError.textContent = msg;
  pwError.classList.remove("hidden");
}

function showGossipGif(){
  if(!pwGossipHost) return;
  if(pwGossipHost.querySelector("img")) return;

  const img = document.createElement("img");
  img.src = "./assets/password/gossip.gif";
  img.alt = "gossip";
  img.style.width = "min(900px, 170vw)";
  img.style.opacity = "0.22";
  img.style.position = "fixed";
  img.style.left = `${Math.random()*70 + 15}%`;
  img.style.top  = `${Math.random()*55 + 18}%`;
  img.style.transform = "translate(-50%,-50%)";
  img.style.zIndex = "0";
  img.style.pointerEvents = "none";
  pwGossipHost.appendChild(img);
}

function submitPassword(){
  const v = pwInput?.value || "";
  if(isValidPassword(v)){
    pwError?.classList.add("hidden");
    pwFails = 0;
    if(pwGossipHost) pwGossipHost.innerHTML = "";
    showOnly("screen-cover");
    return;
  }

  pwFails++;
  if(pwFails === 1) return showPwError("Nope 😼 try again.");
  if(pwFails === 2){
    showPwError('Hint: “Gossip Girls: asked him for the weather”');
    showGossipGif();
    return;
  }
  showPwError("It’s October 3 🙄 girl… come on");
}

pwBtn?.addEventListener("click", submitPassword);
pwInput?.addEventListener("keydown", (e)=>{ if(e.key==="Enter") submitPassword(); });

// ---------- Cover screen ----------
const letterStack = $("letterStack");
const letterGif = $("letterGif");

function openCard(){
  if(!letterGif) return;

  burstSparkles();
  letterGif.src = "./assets/cover/Letter_Opening.gif";

  // small “zoom” feel without breaking layout
  letterStack.style.transform = "scale(1.06)";
  setTimeout(()=> letterStack.style.transform = "scale(1)", 250);

  setTimeout(()=>{
    letterGif.src = "./assets/cover/Letter_Flying.gif";
    showOnly("screen-question");
  }, 700);
}

letterStack?.addEventListener("click", openCard);

// ---------- Question screen (WORKING scaling) ----------
const yesBtn = $("yesBtn");
const noBtn  = $("noBtn");
const bgImg  = $("questionBgImg");
const rageNote = $("rageNote");

let noClicks = 0;
const maxNoClicks = 6;

function updateButtons(){
  if(!yesBtn || !noBtn) return;

  const yesScale = 1 + noClicks * 0.22;
  const noScale  = Math.max(0.55, 1 - noClicks * 0.11);

  // Keep them side-by-side: use transform only (no layout push)
  const tx = Math.min(24, noClicks * 4); // nudge right so it “bullies” no
  yesBtn.style.setProperty("--scale", `${yesScale}`);
  yesBtn.style.setProperty("--tx", `${tx}px`);
  noBtn.style.setProperty("--tx", `${tx}px`);

  if(yesBtn.classList.contains("pound")){
    yesBtn.style.transform = ""; // animation handles it
  }else{
    yesBtn.style.transform = `translateX(${tx}px) scale(${yesScale})`;
  }
  noBtn.style.transform  = `translateX(${tx}px) scale(${noScale})`;

  if(rageNote){
    if(noClicks === 0) rageNote.textContent = "";
    else rageNote.textContent = `Try me bitch. 😡  ${noClicks} / ${maxNoClicks}`;
  }

  if(noClicks >= maxNoClicks){
    noBtn.disabled = true;
    noBtn.textContent = "Hehe. YOU WISH 🤪";
    yesBtn.classList.add("pound");
    if(bgImg) bgImg.src = "./assets/question/bg2.gif";
  }
}

noBtn?.addEventListener("click", ()=>{
  if(noBtn.disabled) return;
  noClicks++;
  updateButtons();
});

yesBtn?.addEventListener("click", ()=>{
  showOnly("screen-schedule");
});

// ---------- Schedule -> Gift ----------
const giftBtn = $("giftBtn");
const roseField = $("roseField");

giftBtn?.addEventListener("click", ()=>{
  showOnly("screen-gift");
  if(!roseField) return;
  roseField.innerHTML = "";
  for(let i=0;i<24;i++){
    const d = document.createElement("div");
    d.className = "rose";
    d.textContent = "🌹";
    roseField.appendChild(d);
  }
});

// ---------- Restart ----------
const restartBtn = $("restartBtn");
restartBtn?.addEventListener("click", ()=>{
  pwFails = 0;
  noClicks = 0;
  if(pwInput) pwInput.value = "";
  if(pwError) pwError.classList.add("hidden");
  if(pwGossipHost) pwGossipHost.innerHTML = "";
  if(sparkles) sparkles.innerHTML = "";

  if(bgImg) bgImg.src = "./assets/question/bg.gif";
  if(noBtn){
    noBtn.disabled = false;
    noBtn.textContent = "Hell nah, Keysha!";
    noBtn.style.transform = "";
  }
  if(yesBtn){
    yesBtn.classList.remove("pound");
    yesBtn.style.transform = "";
    yesBtn.style.removeProperty("--scale");
    yesBtn.style.removeProperty("--tx");
  }
  if(rageNote) rageNote.textContent = "";

  if(letterGif) letterGif.src = "./assets/cover/Letter_Flying.gif";

  showOnly("screen-password");
});

// Make sure question starts in clean state
updateButtons();
