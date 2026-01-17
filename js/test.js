/* ============================================
   TEST.JS - Quiz Details Page Logic
   Extracted from: test.html
   Maviya Attar - Quiz Master Platform
   ============================================ */

/* ===== CONFIGURATION ===== */
const API = "https://quiz-backend-production-4aaf.up.railway.app";
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

/* ===== PARTICIPANTS TAB ===== */
/**
 * Load participants list
 */
async function loadParticipants() {
  const container = document.getElementById("participants");
  container.innerHTML =
    '<div class="loading-skeleton"></div><div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/leaderboard/${code}`);

    if (!response.ok) {
      throw new Error("Failed to load participants");
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: var(--muted); padding: 20px;">No participants yet</p>';
      return;
    }

    container.innerHTML = data
      .map((u) => {
        return `
          <div class="list-item">
            <span>${escapeHtml(u.name)} <small style="color: var(--muted);">(${escapeHtml(u.rollNo)})</small></span>
            <strong>${u.score} pts</strong>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading participants:", err);
    container.innerHTML =
      '<p style="color: var(--danger);">Failed to load participants</p>';
  }
}

/* ===== LEADERBOARD TAB ===== */
/**
 * Load leaderboard
 */
async function loadLeaderboard() {
  const container = document.getElementById("leaderboard");
  container.innerHTML =
    '<div class="loading-skeleton"></div><div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/leaderboard/${code}`);

    if (!response.ok) {
      throw new Error("Failed to load leaderboard");
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: var(--muted); padding: 20px;">No results yet</p>';
      return;
    }

    container.innerHTML = data
      .map((u, i) => {
        const medal =
          i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        return `
          <div class="list-item">
            <span>${medal} ${escapeHtml(u.name)}</span>
            <strong>${u.score} pts</strong>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("Error loading leaderboard:", err);
    container.innerHTML =
      '<p style="color: var(--danger);">Failed to load leaderboard</p>';
  }
}

/* ===== SUMMARY TAB ===== */
/**
 * Load quiz summary statistics
 */
async function loadSummary() {
  const container = document.getElementById("summary");
  container.innerHTML =
    '<div class="loading-skeleton"></div><div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/summary/${code}`);

    if (!response.ok) {
      throw new Error("Failed to load summary");
    }

    const s = await response.json();

    container.innerHTML = `
      <div class="list-item">
        <span><i class="fa fa-users"></i> Total Participants</span>
        <strong>${s.total}</strong>
      </div>
      <div class="list-item">
        <span><i class="fa fa-trophy"></i> Highest Score</span>
        <strong>${s.highest}</strong>
      </div>
      <div class="list-item">
        <span><i class="fa fa-chart-line"></i> Average Score</span>
        <strong>${s.average.toFixed(2)}</strong>
      </div>
    `;
  } catch (err) {
    console.error("Error loading summary:", err);
    container.innerHTML =
      '<p style="color: var(--danger);">Failed to load summary</p>';
  }
}

/* ===== START QUIZ ===== */
/**
 * Start the quiz
 */
async function startQuiz() {
  if (
    !confirm(
      "Start this quiz? Participants will be able to join immediately."
    )
  ) {
    return;
  }

  try {
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
    showNotification(data.msg || "Quiz started successfully!", "success");

    // Reload quiz details
    setTimeout(() => {
      loadQuiz();
    }, 1000);
  } catch (err) {
    console.error("Error starting quiz:", err);
    showNotification("Failed to start quiz", "error");
  }
}

/* ===== DELETE QUIZ ===== */
/**
 * Delete the quiz
 */
async function deleteQuiz() {
  if (
    !confirm(
      "Are you sure you want to permanently delete this quiz? This cannot be undone."
    )
  ) {
    return;
  }

  try {
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
    showNotification(data.msg || "Quiz deleted successfully!", "success");

    // Redirect to dashboard after brief delay
    setTimeout(() => {
      location.href = "dashboard.html";
    }, 1000);
  } catch (err) {
    console.error("Error deleting quiz:", err);
    showNotification("Failed to delete quiz", "error");
  }
}

/* ===== TAB SWITCHING ===== */
/**
 * Switch between tabs
 * @param {string} tabName - Name of tab to show
 * @param {HTMLElement} btn - Button element clicked
 */
function switchTab(tabName, btn) {
  // Remove active class from all tabs and buttons
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));

  // Add active class to selected tab and button
  document.getElementById(tabName).classList.add("active");
  btn.classList.add("active");

  // Load content based on tab
  if (tabName === "participants") {
    loadParticipants();
  } else if (tabName === "leaderboard") {
    loadLeaderboard();
  } else if (tabName === "summary") {
    loadSummary();
  }
}

/* ===== INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Load quiz and initial tab
  loadQuiz();
  loadParticipants(); // Default tab

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
  `;
  document.head.appendChild(style);
}
