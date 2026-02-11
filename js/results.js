/* ============================================
   RESULTS.JS - Quiz Results Page Logic
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

/* ===== STATE MANAGEMENT ===== */
let allParticipants = [];
let currentTab = 'participants';

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
 * Navigate back to test details
 */
function goBack() {
  location.href = `test.html?code=${encodeURIComponent(code)}`;
}

/* ===== QUIZ LOADING ===== */
/**
 * Load quiz details from API
 */
async function loadQuizDetails() {
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
  const container = document.getElementById("participantsList");
  container.innerHTML =
    '<div class="loading-skeleton"></div><div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/leaderboard/${code}`);

    if (!response.ok) {
      throw new Error("Failed to load participants");
    }

    const data = await response.json();
    allParticipants = data;

    if (!data || data.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: var(--muted); padding: 20px;">No participants yet</p>';
      return;
    }

    renderParticipants(data);
  } catch (err) {
    console.error("Error loading participants:", err);
    container.innerHTML =
      '<p style="color: var(--danger);">Failed to load participants</p>';
  }
}

/**
 * Render participants list
 * @param {Array} participants - Array of participant objects
 */
function renderParticipants(participants) {
  const container = document.getElementById("participantsList");
  
  if (!participants || participants.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: var(--muted); padding: 20px;">No participants found</p>';
    return;
  }

  container.innerHTML = participants
    .map((u, index) => {
      return `
        <div class="participant-item">
          <div class="participant-info">
            <div class="participant-name">${escapeHtml(u.name)}</div>
            <div class="participant-details">
              <span><i class="fa fa-id-card"></i> ${escapeHtml(u.rollNo || 'N/A')}</span>
              <span><i class="fa fa-building"></i> ${escapeHtml(u.branch || 'N/A')}</span>
            </div>
          </div>
          <div class="participant-score">
            <strong>${u.score} pts</strong>
          </div>
          <div class="participant-actions">
            <button class="btn-download" onclick="downloadPDF('${escapeHtml(u.name)}', '${escapeHtml(u.rollNo || '')}', ${u.score})" aria-label="Download PDF for ${escapeHtml(u.name)}">
              <i class="fa fa-download"></i> PDF
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Download PDF for a participant
 * @param {string} name - Participant name
 * @param {string} rollNo - Participant roll number
 * @param {number} score - Participant score
 */
function downloadPDF(name, rollNo, score) {
  showNotification(
    "PDF download functionality requires backend integration. The PDF was generated on submission.",
    "info"
  );
}

/**
 * Search participants by name, roll number, or branch
 * @param {string} query - Search query
 */
function searchParticipants(query) {
  if (!query) {
    renderParticipants(allParticipants);
    return;
  }

  const lowerQuery = query.toLowerCase();
  const filtered = allParticipants.filter((p) => {
    const name = (p.name || '').toLowerCase();
    const rollNo = (p.rollNo || '').toLowerCase();
    const branch = (p.branch || '').toLowerCase();
    
    return name.includes(lowerQuery) || 
           rollNo.includes(lowerQuery) || 
           branch.includes(lowerQuery);
  });

  renderParticipants(filtered);
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
          <div class="leaderboard-item">
            <span class="rank">${medal}</span>
            <div class="leaderboard-info">
              <div class="leaderboard-name">${escapeHtml(u.name)}</div>
              <div class="leaderboard-rollno">${escapeHtml(u.rollNo || 'N/A')}</div>
            </div>
            <strong class="leaderboard-score">${u.score} pts</strong>
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
      <div class="summary-grid">
        <div class="summary-card">
          <i class="fa fa-users summary-icon"></i>
          <div class="summary-value">${s.total}</div>
          <div class="summary-label">Total Participants</div>
        </div>
        <div class="summary-card">
          <i class="fa fa-trophy summary-icon"></i>
          <div class="summary-value">${s.highest}</div>
          <div class="summary-label">Highest Score</div>
        </div>
        <div class="summary-card">
          <i class="fa fa-chart-line summary-icon"></i>
          <div class="summary-value">${s.average.toFixed(2)}</div>
          <div class="summary-label">Average Score</div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error loading summary:", err);
    container.innerHTML =
      '<p style="color: var(--danger);">Failed to load summary</p>';
  }
}

/* ===== TAB SWITCHING ===== */
/**
 * Switch between tabs
 * @param {string} tabName - Name of tab to show
 * @param {HTMLElement} btn - Button element clicked
 */
function switchTab(tabName, btn) {
  currentTab = tabName;
  
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

/* ===== UTILITIES ===== */
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

/* ===== INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Load quiz details
  loadQuizDetails();
  
  // Load initial tab (participants)
  loadParticipants();

  // Setup search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchParticipants(e.target.value);
    });
  }

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
