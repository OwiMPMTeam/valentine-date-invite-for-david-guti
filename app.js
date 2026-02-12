const screens = {
  cover: document.getElementById("cover"),
  question: document.getElementById("question"),
  schedule: document.getElementById("schedule"),
  gift: document.getElementById("gift"),
};

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

/* LETTER */
const letterBtn = document.getElementById("letterBtn");
const letterImg = document.getElementById("letterImg");

letterBtn.onclick = () => {
  letterImg.src = "assets/cover/Letter_Opening.gif";
  sparkles();
  setTimeout(() => show("question"), 700);
};

/* QUESTION */
let noClicks = 0;
const yes = document.getElementById("yes");
const no = document.getElementById("no");
const rageText = document.getElementById("rageText");
const rageGif = document.getElementById("rageGif");

no.onclick = () => {
  noClicks++;

  const grow = 1 + noClicks * 0.25;
  const shrink = Math.max(0.6, 1 - noClicks * 0.12);

  yes.style.transform = `scale(${grow})`;
  no.style.transform = `scale(${shrink})`;

  rageText.textContent = `Try me bitch 😡 ${noClicks}/6`;

  if (noClicks >= 6) {
    rageGif.style.display = "block";
    no.textContent = "Hehe. YOU WISH 🤪";
  }
};

yes.onclick = () => show("schedule");

/* GIFT */
document.getElementById("giftBtn").onclick = () => show("gift");

/* SPARKLES */
function sparkles() {
  const wrap = document.getElementById("sparkles");
  wrap.innerHTML = "";

  for (let i = 0; i < 25; i++) {
    const s = document.createElement("span");
    s.textContent = ["✨","⚡️","💖","🏳️‍🌈"][Math.floor(Math.random()*4)];
    s.style.left = Math.random()*100 + "vw";
    s.style.top = "-20px";
    s.style.animationDelay = Math.random()*1 + "s";
    wrap.appendChild(s);
  }

  setTimeout(() => wrap.innerHTML = "", 4000);
}
