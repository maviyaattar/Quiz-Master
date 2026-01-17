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
  
  showConfirmDialog(message, () => {
    submit();
  });
}

/* ==========================================
   SUBMIT QUIZ
   ========================================== */
async function submit() {
  clearInterval(timerInt);
  
  // Remove anti-cheat mechanisms and warning UI
  removeAntiCheat();
  removeWarningUI();

  try {
    // Show loading state
    showLoadingState();
    
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
    showAlert('error', 'Failed to submit quiz. Please try again.');
    // Re-enable the quiz screen
    hideLoadingState();
  }
}

/* ==========================================
   REMOVE ANTI-CHEAT MECHANISMS
   ========================================== */
function removeAntiCheat() {
  // Remove all anti-cheat event listeners
  window.onblur = null;
  window.onbeforeunload = null;
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
  
  // Determine alert type based on warning count
  const alertType = warnings >= 3 ? 'danger' : 'warning';
  const message = warnings >= 3 
    ? 'Too many violations. Auto-submitting quiz now...'
    : 'Do not leave the exam screen!';
  
  // Show warning banner with countdown
  showWarningBanner(message, warnings, alertType);

  if (warnings >= 3) {
    // Auto-submit after 2 seconds
    setTimeout(() => {
      submit();
    }, 2000);
  }
}

/* ==========================================
   SHOW WARNING BANNER
   ========================================== */
function showWarningBanner(message, warningCount, type = 'warning') {
  // Remove existing warning if present
  removeWarningUI();
  
  const warningBanner = document.createElement('div');
  warningBanner.id = 'warningBanner';
  warningBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 16px 20px;
    background: ${type === 'danger' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #f59e0b, #d97706)'};
    color: white;
    font-weight: 600;
    text-align: center;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideDown 0.4s ease-out;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  `;
  
  warningBanner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <i class="fa ${type === 'danger' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}" style="font-size: 24px;"></i>
      <span style="font-size: 16px;">${message}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px; font-weight: 700; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px;">
        Warning ${warningCount} / 3
      </span>
    </div>
  `;
  
  document.body.appendChild(warningBanner);
  
  // Auto-remove warning banner after 5 seconds (unless it's the final warning)
  if (type !== 'danger') {
    setTimeout(() => {
      if (warningBanner && warningBanner.parentNode) {
        warningBanner.style.animation = 'slideUp 0.4s ease-out';
        setTimeout(() => warningBanner.remove(), 400);
      }
    }, 5000);
  }
}

/* ==========================================
   REMOVE WARNING UI
   ========================================== */
function removeWarningUI() {
  const existingBanner = document.getElementById('warningBanner');
  if (existingBanner) {
    existingBanner.remove();
  }
}

/* ==========================================
   SHOW ALERT
   ========================================== */
function showAlert(type, message) {
  // Create or reuse alert container
  let alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alertContainer';
    alertContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    `;
    document.body.appendChild(alertContainer);
  }

  const alert = document.createElement('div');
  alert.style.cssText = `
    padding: 14px 18px;
    border-radius: 12px;
    margin-bottom: 10px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `;

  const colors = {
    success: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
    error: { bg: '#fee2e2', text: '#7f1d1d', border: '#fca5a5' },
    warning: { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
    danger: { bg: '#fee2e2', text: '#7f1d1d', border: '#ef4444' },
    info: { bg: '#dbeafe', text: '#0c2340', border: '#93c5fd' },
  };

  const color = colors[type] || colors.info;
  alert.style.backgroundColor = color.bg;
  alert.style.color = color.text;
  alert.style.borderLeft = `4px solid ${color.border}`;

  alert.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">
        ${type === 'success' ? '✓' : type === 'error' || type === 'danger' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
      </span>
      <span>${sanitizeText(message)}</span>
    </div>
  `;

  alertContainer.appendChild(alert);

  // Auto-remove alert after 4 seconds
  setTimeout(() => {
    alert.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => alert.remove(), 300);
  }, 4000);
}

/* ==========================================
   SHOW CONFIRM DIALOG
   ========================================== */
function showConfirmDialog(message, onConfirm) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'confirmOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  `;
  
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    background: white;
    padding: 28px;
    border-radius: 16px;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    animation: scaleIn 0.3s ease-out;
  `;
  
  dialog.innerHTML = `
    <div style="text-align: center;">
      <i class="fa fa-question-circle" style="font-size: 48px; color: var(--primary); margin-bottom: 16px;"></i>
      <h3 style="margin-bottom: 12px; color: var(--text);">Confirm Submission</h3>
      <p style="color: var(--muted); margin-bottom: 24px; white-space: pre-line;">${sanitizeText(message)}</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="confirmNo" style="
          padding: 12px 24px;
          border: 2px solid var(--primary);
          background: white;
          color: var(--primary);
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">Cancel</button>
        <button id="confirmYes" style="
          padding: 12px 24px;
          border: none;
          background: var(--primary);
          color: white;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">Submit Quiz</button>
      </div>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  // Event listeners
  document.getElementById('confirmNo').onclick = () => {
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => overlay.remove(), 300);
  };
  
  document.getElementById('confirmYes').onclick = () => {
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      overlay.remove();
      onConfirm();
    }, 300);
  };
  
  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => overlay.remove(), 300);
    }
  };
}

/* ==========================================
   SHOW LOADING STATE
   ========================================== */
function showLoadingState() {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loadingOverlay';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  `;
  
  loadingOverlay.innerHTML = `
    <div class="loading-spinner"></div>
    <p style="margin-top: 20px; font-size: 16px; font-weight: 600; color: var(--primary);">
      Submitting your quiz...
    </p>
  `;
  
  document.body.appendChild(loadingOverlay);
}

/* ==========================================
   HIDE LOADING STATE
   ========================================== */
function hideLoadingState() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
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
  
  // Prevent page refresh/navigation during quiz
  window.onbeforeunload = (e) => {
    e.preventDefault();
    warn();
    return "Are you sure you want to leave? Your quiz progress may be lost.";
  };
  
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
