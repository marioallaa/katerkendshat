// ===== Flowchart definitions (MESO) =====
const QUESTIONS = {
  Q1: { text: "A ka katërkëndëshi dy çifte brinjësh paralele?", yes: "Q2A", no: "Q1B" },
  Q1B:{ text: "A ka katërkëndëshi një çift brinjësh paralele?", yes: "E", no: "F" },
  Q2A:{ text: "A kanë të gjitha brinjët të njëjtën gjatësi?", yes: "Q3A", no: "Q4A" },
  Q3A:{ text: "A janë të gjithë këndet të barabarta me 90°?", yes: "A", no: "B" },
  Q4A:{ text: "A janë të gjithë këndet të barabarta me 90°?", yes: "C", no: "D" },
};

const RESULTS = {
  A: { name:"Katror", desc:"Dy çifte brinjësh paralele, të gjitha brinjët të barabarta dhe të gjithë këndet 90°.", draw: drawSquare },
  B: { name:"Romb", desc:"Dy çifte brinjësh paralele, të gjitha brinjët të barabarta, kënde jo domosdoshmërisht 90°.", draw: drawRhombus },
  C: { name:"Drejtkëndësh", desc:"Dy çifte brinjësh paralele, kënde 90°, brinjët përballë me gjatësi të barabartë.", draw: drawRectangle },
  D: { name:"Paralelogram", desc:"Dy çifte brinjësh paralele, pa kënde të gjitha 90° dhe jo të gjitha brinjët të barabarta.", draw: drawParallelogram },
  E: { name:"Trapéz", desc:"Një çift i vetëm brinjësh paralele.", draw: drawTrapezoid },
  F: { name:"Katërkëndësh i zakonshëm", desc:"Asnjë çift brinjësh paralele.", draw: drawGeneralQuad },
};

// ===== State =====
const gameArea = document.getElementById("gameArea");
const leaderboardBody = document.getElementById("leaderboardBody");
const leaderboardSection = document.getElementById("leaderboard");
const nameModal = document.getElementById("nameModal");
const playerNameInput = document.getElementById("playerNameInput");
let mode = "meso"; // default
let currentNode = "Q1";

// ===== MESO =====
function startMeso() {
  mode = "meso";
  leaderboardSection.classList.add("hidden");
  currentNode = "Q1";
  renderMesoQuestion();
}
function renderMesoQuestion() {
  const q = QUESTIONS[currentNode];
  if (!q) {
    const r = RESULTS[currentNode];
    gameArea.innerHTML = `
      <h2>${r.name}</h2>
      <p>${r.desc}</p>
      <div id="canvas"></div>
      <button onclick="startMeso()">Rifillo</button>
    `;
    document.getElementById("canvas").appendChild(r.draw());
    return;
  }
  gameArea.innerHTML = `
    <h2>Pyetje</h2>
    <p>${q.text}</p>
    <button onclick="mesoAnswer('yes')">PO</button>
    <button onclick="mesoAnswer('no')">JO</button>
  `;
}
function mesoAnswer(ans) {
  const q = QUESTIONS[currentNode];
  currentNode = (ans === "yes") ? q.yes : q.no;
  renderMesoQuestion();
}

// ===== LOJA (quiz) =====
let score = 0, timeLeft = 60, timer, playerName="";
function startQuiz() {
  mode = "quiz";
  leaderboardSection.classList.remove("hidden");
  score = 0; timeLeft = 60;
  gameArea.innerHTML = `
    <h2>LOJA</h2>
    <div id="quizStatus">Pikët: 0 | Koha: 60s</div>
    <div id="quizQuestion"></div>
    <div id="quizChoices" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;"></div>
  `;
  nextQuestion();
  timer = setInterval(()=>{
    timeLeft--;
    document.getElementById("quizStatus").textContent = `Pikët: ${score} | Koha: ${timeLeft}s`;
    if (timeLeft<=0) endQuiz();
  },1000);
}
function nextQuestion() {
  const codes = Object.keys(RESULTS);
  const correctCode = codes[Math.floor(Math.random()*codes.length)];
  const r = RESULTS[correctCode];

  // Pyetja vetëm me përshkrim
  document.getElementById("quizQuestion").innerHTML = `Cila figurë ka këtë përshkrim: <em>${r.desc}</em>?`;

  // Opsionet = figurat SVG
  const shuffled = shuffle(codes);
  const html = shuffled.map(c => {
    const container = document.createElement("div");
    container.className = "choice";
    container.dataset.code = c;
    container.appendChild(RESULTS[c].draw());
    return container.outerHTML;
  }).join("");
  document.getElementById("quizChoices").innerHTML = html;

  document.querySelectorAll(".choice").forEach(el=>{
    el.onclick=()=>{
      if(el.dataset.code===correctCode){ el.classList.add("correct"); score++; }
      else el.classList.add("incorrect");
      setTimeout(nextQuestion,500);
    };
  });
}
function endQuiz() {
  clearInterval(timer);
  gameArea.innerHTML = `<h2>Koha mbaroi!</h2><p>Pikët: ${score}</p><button onclick="openNameModal()">Luaj përsëri</button>`;
  saveScore(playerName, score);
  renderLeaderboard();
}

// ===== Leaderboard =====
function saveScore(name,points){
  const lb=JSON.parse(localStorage.getItem("leaderboard")||"[]");
  lb.push({name,points});
  lb.sort((a,b)=>b.points-a.points);
  localStorage.setItem("leaderboard",JSON.stringify(lb.slice(0,10)));
}
function renderLeaderboard(){
  const lb=JSON.parse(localStorage.getItem("leaderboard")||"[]");
  leaderboardBody.innerHTML=lb.map((row,i)=>`<tr><td>${i+1}</td><td>${row.name}</td><td>${row.points}</td></tr>`).join("");
}

// ===== Helpers =====
function shuffle(arr){ return [...arr].sort(()=>Math.random()-0.5); }
function openNameModal(){ nameModal.classList.remove("hidden"); }
document.getElementById("startQuizBtn").onclick=()=>{
  playerName=playerNameInput.value.trim();
  if(!playerName) playerName="Lojtar#"+Math.floor(Math.random()*1000);
  nameModal.classList.add("hidden");
  startQuiz();
};

// ===== SVG Drawings =====
function baseSvg(){
  const NS = "http://www.w3.org/2000/svg";
  const s = document.createElementNS(NS,"svg");
  s.setAttribute("viewBox","0 0 100 70");
  const p = document.createElementNS(NS,"polyline");
  s.appendChild(p);
  return {s,NS};
}
function strokeShape(s, pts){
  const p=s.s.querySelector("polyline");
  p.setAttribute("points",pts.map(([x,y])=>`${x},${y}`).join(" "));
  p.setAttribute("fill","rgba(110,168,254,.22)");
  p.setAttribute("stroke","#7ef0ff");
  p.setAttribute("stroke-width","2.2");
  p.setAttribute("stroke-linejoin","round");
  return s.s;
}
function drawSquare(){return strokeShape(baseSvg(),[[30,20],[70,20],[70,60],[30,60],[30,20]]);}
function drawRectangle(){return strokeShape(baseSvg(),[[20,25],[80,25],[80,55],[20,55],[20,25]]);}
function drawRhombus(){return strokeShape(baseSvg(),[[25,40],[45,20],[75,40],[55,60],[25,40]]);}
function drawParallelogram(){return strokeShape(baseSvg(),[[25,25],[80,25],[60,55],[5,55],[25,25]]);}
function drawTrapezoid(){return strokeShape(baseSvg(),[[25,25],[75,25],[65,55],[15,55],[25,25]]);}
function drawGeneralQuad(){return strokeShape(baseSvg(),[[20,30],[78,22],[65,60],[10,50],[20,30]]);}

// ===== Nav =====
document.getElementById("mesoBtn").onclick=startMeso;
document.getElementById("lojaBtn").onclick=openNameModal;

// ===== Init =====
startMeso();
renderLeaderboard();