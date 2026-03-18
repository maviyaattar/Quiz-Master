/* ============================================
   TEST.JS - Quiz Details Page Logic
   Extracted from: test.html
   Maviya Attar - Quiz Master Platform
   ============================================ */

/* ===== CONFIGURATION ===== */
const API = "https://portfolio-backend-api-8me4.onrender.com";
const token = localStorage.getItem("token");
const code = new URLSearchParams(location.search).get("code");

// Redirect to dashboard if missing credentials
if (!token || !code) {
  location.href = "dashboard.html";
}

/* ===== UTILITY: INPUT SANITIZATION ===== */
/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Escapes HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/* ===== NAVIGATION ===== */
/**
 * Navigate back to dashboard
 */
function goBack() {
  location.href = "dashboard.html";
}

/* ===== UTILITIES ===== */
/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification("✓ Copied to clipboard!", "success");
  });
}

/**
 * Show notification message
 * @param {string} message - Message to show
 * @param {string} type - Message type
 */
function showNotification(message, type = "info") {
  const container =
    document.getElementById("notificationContainer") ||
    createNotificationContainer();
  const notification = document.createElement("div");

  const colors = {
    success: { bg: "#d1fae5", text: "#065f46" },
    error: { bg: "#fee2e2", text: "#7f1d1d" },
    info: { bg: "#dbeafe", text: "#0c2340" },
  };

  const color = colors[type] || colors.info;

  notification.style.cssText = `
    padding: 12px 16px;
    background: ${color.bg};
    color: ${color.text};
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;

  notification.innerHTML = escapeHtml(message);
  container.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Create notification container
 */
function createNotificationContainer() {
  const container = document.createElement("div");
  container.id = "notificationContainer";
  container.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 1000;
    max-width: 350px;
  `;
  document.body.appendChild(container);
  return container;
}

/* ===== QUIZ LOADING ===== */
/**
 * Load quiz details from API
 */
async function loadQuiz() {
  try {
    const response = await fetch(`${API}/api/quiz/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load quiz");
    }

    const q = await response.json();

    // Update title and description
    document.getElementById("quizTitle").innerText = sanitizeInput(q.title);
    document.getElementById("quizDesc").innerText = sanitizeInput(
      q.description
    );
    document.getElementById("detailTitle").innerText = sanitizeInput(
      q.title
    );
    document.getElementById("detailDesc").innerText = sanitizeInput(
      q.description
    );

    // Update quiz code and link
    const quizCodeElement = document.getElementById("quizCode");
    const quizLinkElement = document.getElementById("quizLink");

    quizCodeElement.innerText = sanitizeInput(q.code);
    quizLinkElement.innerText = `${location.origin}/join.html?code=${encodeURIComponent(
      q.code
    )}`;

    // Update status badge
    const statusBadge = document.getElementById("statusBadge");
    const statusClass = sanitizeInput(q.status);
    statusBadge.className = `badge ${statusClass}`;
    statusBadge.innerText = statusClass.toUpperCase();
  } catch (err) {
    console.error("Error loading quiz:", err);
    showNotification("Failed to load quiz details", "error");
    document.getElementById("quizTitle").innerText = "Error loading quiz";
  }
}

/* ===== SHOW RESULTS PAGE ===== */
/**
 * Navigate to results page
 */
function showResults() {
  location.href = `results.html?code=${encodeURIComponent(code)}`;
}

/* ===== START QUIZ ===== */
/**
 * Start the quiz
 */
async function startQuiz() {
  showConfirmDialog(
    "Start this quiz? Participants will be able to join immediately.",
    async () => {
      try {
        showLoadingState("Starting quiz...");
        
        const response = await fetch(`${API}/api/quiz/start/${code}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to start quiz");
        }

        const data = await response.json();
        hideLoadingState();
        showNotification(data.msg || "Quiz started successfully!", "success");

        // Reload quiz details
        setTimeout(() => {
          loadQuiz();
        }, 1000);
      } catch (err) {
        console.error("Error starting quiz:", err);
        hideLoadingState();
        showNotification("Failed to start quiz", "error");
      }
    }
  );
}

/* ===== DELETE QUIZ ===== */
/**
 * Delete the quiz
 */
async function deleteQuiz() {
  showConfirmDialog(
    "Are you sure you want to permanently delete this quiz? This cannot be undone.",
    async () => {
      try {
        showLoadingState("Deleting quiz...");
        
        const response = await fetch(`${API}/api/quiz/delete/${code}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete quiz");
        }

        const data = await response.json();
        hideLoadingState();
        showNotification(data.msg || "Quiz deleted successfully!", "success");

        // Redirect to dashboard after brief delay
        setTimeout(() => {
          location.href = "dashboard.html";
        }, 1000);
      } catch (err) {
        console.error("Error deleting quiz:", err);
        hideLoadingState();
        showNotification("Failed to delete quiz", "error");
      }
    }
  );
}

/* ===== EDIT QUIZ ===== */
/**
 * Navigate to edit quiz page
 */
function editQuiz() {
  // Redirect to create page with the quiz code as a parameter
  // This allows the create page to load the quiz for editing
  location.href = `create.html?code=${encodeURIComponent(code)}`;
}

/* ===== RESET QUIZ ===== */
/**
 * Reset quiz by cloning it with a new code
 */
async function resetQuiz() {
  showConfirmDialog(
    "Reset this quiz? A new quiz with a fresh code will be created. The current quiz will remain unchanged.",
    async () => {
      try {
        showLoadingState("Cloning quiz...");
        
        // Fetch current quiz data
        const quizResponse = await fetch(`${API}/api/quiz/${code}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!quizResponse.ok) {
          throw new Error("Failed to load quiz data");
        }

        const quizData = await quizResponse.json();
        
        // Create a new quiz with the same data (clone)
        const createResponse = await fetch(`${API}/api/quiz/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: quizData.title,
            description: quizData.description,
            duration: quizData.duration,
            questions: quizData.questions,
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create cloned quiz");
        }

        const newQuiz = await createResponse.json();
        hideLoadingState();
        showNotification("Quiz cloned successfully! Redirecting...", "success");

        // Redirect to the new quiz
        setTimeout(() => {
          location.href = `test.html?code=${encodeURIComponent(newQuiz.code)}`;
        }, 1500);
      } catch (err) {
        console.error("Error resetting quiz:", err);
        hideLoadingState();
        showNotification("Failed to reset quiz. Please try again.", "error");
      }
    }
  );
}

/* ===== TAB SWITCHING ===== */
/**
 * Switch between tabs (removed - now navigates to results page)
 */

/* ===== INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Load quiz details
  loadQuiz();

  // Add animation styles
  addAnimationStyles();
});

/**
 * Add animation styles
 */
function addAnimationStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    
    @keyframes scaleIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

/* ===== SHOW CONFIRM DIALOG ===== */
/**
 * Show styled confirmation dialog
 * @param {string} message - Message to display
 * @param {function} onConfirm - Callback on confirmation
 */
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
      <h3 style="margin-bottom: 12px; color: var(--text);">Confirm Action</h3>
      <p style="color: var(--muted); margin-bottom: 24px;">${escapeHtml(message)}</p>
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
        ">Confirm</button>
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

/* ===== SHOW LOADING STATE ===== */
/**
 * Show loading overlay
 * @param {string} message - Loading message
 */
function showLoadingState(message = "Loading...") {
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
      width: 60px;
      height: 60px;
      border: 6px solid rgba(91, 108, 255, 0.2);
      border-top: 6px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    "></div>
    <p style="margin-top: 20px; font-size: 16px; font-weight: 600; color: var(--primary);">
      ${escapeHtml(message)}
    </p>
  `;
  
  // Add spin animation if not present
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
  
  document.body.appendChild(loadingOverlay);
}

/* ===== HIDE LOADING STATE ===== */
/**
 * Hide loading overlay
 */
function hideLoadingState() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}
