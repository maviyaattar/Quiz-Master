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

// PERFORMANCE: Cache frequently accessed DOM elements to avoid repeated lookups
let cachedElements = null;

/* ==========================================
   CACHE DOM ELEMENTS - PERFORMANCE OPTIMIZATION
   ========================================== */
function cacheElements() {
  if (!cachedElements) {
    cachedElements = {
      progressEl: document.getElementById('progress'),
      questionEl: document.getElementById('question'),
      optionsEl: document.getElementById('options'),
      progressBar: document.getElementById('progressBar'),
      timer: document.getElementById('timer'),
      quizScreen: document.getElementById('quizScreen'),
      waitScreen: document.getElementById('waitScreen'),
      thankScreen: document.getElementById('thankScreen')
    };
  }
  return cachedElements;
}

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

      // PERFORMANCE: Cache DOM elements before starting quiz
      cacheElements();

      // Show quiz screen
      const elements = cacheElements();
      elements.waitScreen.classList.add("hide");
      elements.quizScreen.classList.remove("hide");

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
  const elements = cacheElements();
  timerInt = setInterval(() => {
    const diff = endTime - new Date();
    
    if (diff <= 0) {
      submit();
      return;
    }
    
    // PERFORMANCE: Minimize string operations
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    elements.timer.innerText = `⏱ ${m}:${s.toString().padStart(2, "0")}`;
  }, 1000);
}

/* ==========================================
   RENDER CURRENT QUESTION
   PERFORMANCE OPTIMIZED: Uses cached DOM elements, event delegation, and minimal DOM updates
   ========================================== */
function render() {
  const q = questions[index];
  const elements = cacheElements();

  // PERFORMANCE: Update progress text (minimal DOM manipulation)
  elements.progressEl.innerText = `Question ${index + 1} of ${questions.length}`;
  
  // PERFORMANCE: Update progress bar with transform for better performance
  if (elements.progressBar) {
    const progressPercent = ((index + 1) / questions.length) * 100;
    elements.progressBar.style.width = progressPercent + '%';
  }
  
  // Sanitize and update question text
  elements.questionEl.innerText = sanitizeText(q.text);
  
  // PERFORMANCE: Use DocumentFragment for batch DOM updates
  const fragment = document.createDocumentFragment();

  q.options.forEach((o, i) => {
    const d = document.createElement("div");
    d.className = "option" + (answers[index] === i ? " active" : "");
    d.innerText = sanitizeText(o);
    // PERFORMANCE: Store index in data attribute for event delegation
    d.setAttribute('data-option-index', i);
    fragment.appendChild(d);
  });

  // PERFORMANCE: Clear and update in one operation
  elements.optionsEl.innerHTML = "";
  elements.optionsEl.appendChild(fragment);

  // Update navigation buttons
  updateNavigationButtons();
}

/* ==========================================
   HANDLE OPTION CLICK - EVENT DELEGATION
   ========================================== */
function handleOptionClick(e) {
  const optionDiv = e.target.closest('.option');
  if (!optionDiv) return;
  
  const optionIndex = parseInt(optionDiv.getAttribute('data-option-index'), 10);
  if (!isNaN(optionIndex)) {
    answers[index] = optionIndex;
    // PERFORMANCE: Only update the affected elements instead of full re-render
    const elements = cacheElements();
    const allOptions = elements.optionsEl.querySelectorAll('.option');
    allOptions.forEach((opt, i) => {
      opt.className = 'option' + (i === optionIndex ? ' active' : '');
    });
  }
}

// PERFORMANCE: Set up event delegation once on the options container
document.addEventListener('DOMContentLoaded', () => {
  const elements = cacheElements();
  if (elements.optionsEl) {
    elements.optionsEl.addEventListener('click', handleOptionClick);
  }
});

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

    // FIX: Hide loading overlay before showing thank you screen
    hideLoadingState();
    
    // PERFORMANCE: Use cached elements
    const elements = cacheElements();
    elements.quizScreen.classList.add("hide");
    elements.thankScreen.classList.remove("hide");
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
  
  // ENHANCEMENT: Increased warning threshold from 3 to 5
  // Determine alert type based on warning count
  const alertType = warnings >= 5 ? 'danger' : 'warning';
  const message = warnings >= 5 
    ? 'Too many violations. Auto-submitting quiz now...'
    : 'Do not leave the exam screen!';
  
  // Show warning banner with countdown
  showWarningBanner(message, warnings, alertType);

  if (warnings >= 5) {
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
        Warning ${warningCount} / 5
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
   PERFORMANCE OPTIMIZED: Reuses container and minimizes DOM operations
   ========================================== */
function showAlert(type, message) {
  // PERFORMANCE: Reuse alert container instead of querying every time
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

  // PERFORMANCE: Use object literal lookup instead of multiple comparisons
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

  // PERFORMANCE: Minimize innerHTML operations
  const icons = {
    success: '✓',
    error: '✕',
    danger: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  alert.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">
        ${icons[type] || icons.info}
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
   PERFORMANCE OPTIMIZED: Reuses animation styles
   ========================================== */
function showLoadingState() {
  // PERFORMANCE: Only add spin animation once
  if (!document.getElementById('spinAnimation')) {
    const style = document.createElement('style');
    style.id = 'spinAnimation';
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
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
    <div style="
      display: inline-block;
      width: 60px;
      height: 60px;
      border: 6px solid rgba(91, 108, 255, 0.2);
      border-top: 6px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    "></div>
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
    warn();
    // Return string to trigger browser's native confirmation dialog
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
