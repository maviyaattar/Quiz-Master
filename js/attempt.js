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

// Populate wait screen with user info (with null checks)
const waitName = document.getElementById('waitName');
const waitCode = document.getElementById('waitCode');
if (waitName && joiner && joiner.name) {
  waitName.textContent = joiner.name;
}
if (waitCode && code) {
  waitCode.textContent = code;
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
    
    // If quiz hasn't started yet, keep showing wait screen
    if (!r.ok) {
      // Keep waiting, don't show any error
      return;
    }
    
    const d = await r.json();
    
    // Check if we have questions (quiz has started)
    if (d.questions && d.questions.length > 0) {
      clearInterval(poll);

      questions = d.questions;
      endTime = new Date(d.endTime);

      // Show quiz screen
      document.getElementById('waitScreen').classList.add("hide");
      document.getElementById('quizScreen').classList.remove("hide");

      // Setup anti-cheat mechanisms when quiz starts
      setupAntiCheat();

      render();
      startTimer();
    }
  } catch (err) {
    // Keep waiting silently, don't show error to user
    console.log('Waiting for quiz to start...');
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
  const progressBar = document.getElementById('progressBar');

  // Update progress
  progressEl.innerText = `Question ${index + 1} of ${questions.length}`;
  
  // Update progress bar (with null check)
  if (progressBar) {
    const progressPercent = ((index + 1) / questions.length) * 100;
    progressBar.style.width = progressPercent + '%';
  }
  
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

  // Update navigation buttons
  updateNavigationButtons();
}

/* ==========================================
   UPDATE NAVIGATION BUTTONS
   ========================================== */
function updateNavigationButtons() {
  const navBtns = document.querySelector('.nav-btns');
  const isLastQuestion = index === questions.length - 1;

  navBtns.innerHTML = `
    <button class="btn outline" onclick="prevQuestion()" ${index === 0 ? 'disabled' : ''}>
      <i class="fa fa-arrow-left"></i> Previous
    </button>
    <button class="btn" onclick="${isLastQuestion ? 'confirmSubmit()' : 'nextQuestion()'}">
      ${isLastQuestion ? '<i class="fa fa-check"></i> Submit Quiz' : 'Next <i class="fa fa-arrow-right"></i>'}
    </button>
  `;
}

/* ==========================================
   NAVIGATION FUNCTIONS
   ========================================== */
function nextQuestion() {
  if (index < questions.length - 1) {
    index++;
    render();
  }
}

function prevQuestion() {
  if (index > 0) {
    index--;
    render();
  }
}

/* ==========================================
   CONFIRM SUBMISSION
   ========================================== */
function confirmSubmit() {
  // Count unanswered questions
  const unanswered = questions.length - answers.filter(a => a !== undefined).length;
  
  let message = "Are you sure you want to submit your quiz?";
  if (unanswered > 0) {
    message += `\n\nYou have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.`;
  }
  
  if (confirm(message)) {
    submit();
  }
}

/* ==========================================
   SUBMIT QUIZ
   ========================================== */
async function submit() {
  clearInterval(timerInt);
  
  // Remove anti-cheat mechanisms after submission
  removeAntiCheat();

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
   REMOVE ANTI-CHEAT MECHANISMS
   ========================================== */
function removeAntiCheat() {
  // Remove all anti-cheat event listeners
  window.onblur = null;
  document.oncontextmenu = null;
  document.oncopy = null;
  
  // Remove visibility change listener
  document.removeEventListener("visibilitychange", handleVisibilityChange);
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

// Visibility change handler (needs to be a named function for removal)
function handleVisibilityChange() {
  if (document.hidden) warn();
}

// Setup anti-cheat on quiz start
function setupAntiCheat() {
  // Detect window blur (user switches tabs/apps)
  window.onblur = warn;
  
  // Detect visibility change (tab hidden)
  document.addEventListener("visibilitychange", handleVisibilityChange);
  
  // Prevent right-click context menu
  document.oncontextmenu = (e) => e.preventDefault();
  
  // Prevent text copying
  document.oncopy = (e) => e.preventDefault();
}

/* ==========================================
   SECURITY - SANITIZE TEXT
   ========================================== */
function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.textContent;
}
