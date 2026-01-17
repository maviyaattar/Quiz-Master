/* ==========================================
   ATTEMPT QUIZ PAGE JAVASCRIPT
   ========================================== */

// Configuration
const API = "https://quiz-backend-production-4aaf.up.railway.app";
const code = new URLSearchParams(location.search).get("code");
const joiner = JSON.parse(localStorage.getItem("joiner"));

// Validate and redirect if missing data
if (!code || !joiner) {
  location.href = "join.html";
}

// State variables
let questions = [];
let answers = [];
let index = 0;
let endTime = null;
let timerInt = null;
let warnings = 0;

/* ==========================================
   WAIT FOR START - AUTO POLLING
   ========================================== */
const poll = setInterval(async () => {
  try {
    const r = await fetch(`${API}/api/quiz/questions/${code}`);
    if (!r.ok) return;
    
    const d = await r.json();
    clearInterval(poll);

    questions = d.questions;
    endTime = new Date(d.endTime);

    // Show quiz screen
    document.getElementById('waitScreen').classList.add("hide");
    document.getElementById('quizScreen').classList.remove("hide");

    render();
    startTimer();
  } catch (err) {
    console.error('Polling error:', err);
  }
}, 3000);

/* ==========================================
   TIMER FUNCTIONALITY
   ========================================== */
function startTimer() {
  timerInt = setInterval(() => {
    const diff = endTime - new Date();
    
    if (diff <= 0) {
      submit();
      return;
    }
    
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('timer').innerText = `⏱ ${m}:${s.toString().padStart(2, "0")}`;
  }, 1000);
}

/* ==========================================
   RENDER CURRENT QUESTION
   ========================================== */
function render() {
  const q = questions[index];
  const progressEl = document.getElementById('progress');
  const questionEl = document.getElementById('question');
  const optionsEl = document.getElementById('options');

  // Update progress
  progressEl.innerText = `Question ${index + 1} of ${questions.length}`;
  
  // Sanitize and update question text
  questionEl.innerText = sanitizeText(q.text);
  
  // Clear and rebuild options
  optionsEl.innerHTML = "";

  q.options.forEach((o, i) => {
    const d = document.createElement("div");
    d.className = "option" + (answers[index] === i ? " active" : "");
    d.innerText = sanitizeText(o);
    d.onclick = () => {
      answers[index] = i;
      render();
    };
    optionsEl.appendChild(d);
  });
}

/* ==========================================
   NAVIGATION FUNCTIONS
   ========================================== */
function nextQuestion() {
  if (index < questions.length - 1) {
    index++;
    render();
  } else {
    submit();
  }
}

function prevQuestion() {
  if (index > 0) {
    index--;
    render();
  }
}

/* ==========================================
   SUBMIT QUIZ
   ========================================== */
async function submit() {
  clearInterval(timerInt);

  try {
    await fetch(`${API}/api/quiz/submit/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...joiner, answers })
    });

    // Show thank you screen
    document.getElementById('quizScreen').classList.add("hide");
    document.getElementById('thankScreen').classList.remove("hide");
    localStorage.removeItem("joiner");
  } catch (err) {
    console.error('Submit error:', err);
    alert('Failed to submit quiz. Please try again.');
  }
}

/* ==========================================
   ANTI-CHEAT - WARNING SYSTEM
   ========================================== */
function warn() {
  warnings++;
  alert(`Warning ${warnings}/3: Do not leave the exam screen`);

  if (warnings >= 3) {
    alert("Too many violations. Submitting quiz.");
    submit();
  }
}

// Detect window blur (user switches tabs/apps)
window.onblur = warn;

// Detect visibility change (tab hidden)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) warn();
});

// Prevent right-click context menu
document.oncontextmenu = (e) => e.preventDefault();

// Prevent text copying
document.oncopy = (e) => e.preventDefault();

/* ==========================================
   SECURITY - SANITIZE TEXT
   ========================================== */
function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.textContent;
}
