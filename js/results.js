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

/* ===== STATE ===== */
let allParticipants = [];
let filteredParticipants = [];

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
 * Navigate back to quiz dashboard
 */
function goBack() {
  location.href = `test.html?code=${encodeURIComponent(code)}`;
}

/* ===== QUIZ INFO LOADING ===== */
/**
 * Load quiz basic information
 */
async function loadQuizInfo() {
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
    document.getElementById("quizDesc").innerText = sanitizeInput(q.description);
    document.getElementById("pageTitle").innerText = `${sanitizeInput(q.title)} - Results`;
  } catch (err) {
    console.error("Error loading quiz info:", err);
    showNotification("Failed to load quiz information", "error");
  }
}

/* ===== PARTICIPANTS TAB ===== */
/**
 * Load all participants with detailed information
 */
async function loadParticipants() {
  const container = document.getElementById("participantsTable");
  container.innerHTML = '<div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/participants/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load participants");
    }

    const data = await response.json();
    allParticipants = data;
    filteredParticipants = data;

    renderParticipantsTable();
  } catch (err) {
    console.error("Error loading participants:", err);
    container.innerHTML = '<p style="color: var(--danger); text-align: center; padding: 20px;">Failed to load participants</p>';
  }
}

/**
 * Render participants table
 */
function renderParticipantsTable() {
  const container = document.getElementById("participantsTable");

  if (!filteredParticipants || filteredParticipants.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No participants found</p>';
    return;
  }

  const tableHTML = `
    <table class="participants-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Roll No</th>
          <th>Branch</th>
          <th>Score</th>
          <th>Submitted At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filteredParticipants
          .map((p) => {
            const submittedDate = new Date(p.submittedAt);
            const formattedDate = submittedDate.toLocaleDateString();
            const formattedTime = submittedDate.toLocaleTimeString();
            
            return `
              <tr class="participant-row">
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>${escapeHtml(p.rollNo)}</td>
                <td>${escapeHtml(p.branch || 'N/A')}</td>
                <td><span class="score-badge">${p.score} pts</span></td>
                <td><small>${formattedDate} ${formattedTime}</small></td>
                <td>
                  <button 
                    class="btn-download" 
                    onclick="downloadParticipantPDF('${escapeHtml(p.rollNo)}')"
                    aria-label="Download PDF for ${escapeHtml(p.name)}"
                  >
                    <i class="fa fa-download"></i> PDF
                  </button>
                </td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
}

/**
 * Search/filter participants
 */
function searchParticipants() {
  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    filteredParticipants = allParticipants;
  } else {
    filteredParticipants = allParticipants.filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        p.rollNo.toLowerCase().includes(query) ||
        (p.branch && p.branch.toLowerCase().includes(query))
      );
    });
  }

  renderParticipantsTable();
}

/**
 * Download PDF for a specific participant
 * @param {string} rollNo - Participant's roll number
 */
async function downloadParticipantPDF(rollNo) {
  try {
    showLoadingState("Generating PDF...");

    const response = await fetch(`${API}/api/quiz/participant-pdf/${code}/${encodeURIComponent(rollNo)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    // Get the blob from response
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rollNo}_results.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    hideLoadingState();
    showNotification("PDF downloaded successfully!", "success");
  } catch (err) {
    console.error("Error downloading PDF:", err);
    hideLoadingState();
    showNotification("Failed to download PDF", "error");
  }
}

/* ===== LEADERBOARD TAB ===== */
/**
 * Load leaderboard
 */
async function loadLeaderboard() {
  const container = document.getElementById("leaderboard");
  container.innerHTML = '<div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/leaderboard/${code}`);

    if (!response.ok) {
      throw new Error("Failed to load leaderboard");
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No results yet</p>';
      return;
    }

    container.innerHTML = `
      <div class="leaderboard-list">
        ${data
          .map((u, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            const rankClass = i < 3 ? "top-rank" : "";
            
            return `
              <div class="leaderboard-item ${rankClass}">
                <div class="rank">${medal}</div>
                <div class="player-info">
                  <strong>${escapeHtml(u.name)}</strong>
                  <small>${escapeHtml(u.rollNo)}</small>
                </div>
                <div class="score-badge">${u.score} pts</div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  } catch (err) {
    console.error("Error loading leaderboard:", err);
    container.innerHTML = '<p style="color: var(--danger); text-align: center; padding: 20px;">Failed to load leaderboard</p>';
  }
}

/* ===== SUMMARY TAB ===== */
/**
 * Load quiz summary statistics
 */
async function loadSummary() {
  const container = document.getElementById("summary");
  container.innerHTML = '<div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/summary/${code}`);

    if (!response.ok) {
      throw new Error("Failed to load summary");
    }

    const s = await response.json();

    container.innerHTML = `
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fa fa-users"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Total Participants</div>
            <div class="summary-value">${s.total}</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon trophy">
            <i class="fa fa-trophy"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Highest Score</div>
            <div class="summary-value">${s.highest} pts</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon chart">
            <i class="fa fa-chart-line"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Average Score</div>
            <div class="summary-value">${s.average.toFixed(2)} pts</div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error loading summary:", err);
    container.innerHTML = '<p style="color: var(--danger); text-align: center; padding: 20px;">Failed to load summary</p>';
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
  document.querySelectorAll(".tab-content").forEach((t) => t.classList.remove("active"));
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

/* ===== UI UTILITIES ===== */
/**
 * Display notification messages
 * @param {string} message - Message to display
 * @param {string} type - Message type
 */
function showNotification(message, type = "info") {
  const container = document.getElementById("notificationContainer") || createNotificationContainer();
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

/**
 * Show loading overlay
 * @param {string} message - Loading message
 */
function showLoadingState(message = "Loading...") {
  const overlay = document.createElement("div");
  overlay.id = "loadingOverlay";
  overlay.style.cssText = `
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

  overlay.innerHTML = `
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
      ${escapeHtml(message)}
    </p>
  `;

  document.body.appendChild(overlay);
}

/**
 * Hide loading overlay
 */
function hideLoadingState() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.remove();
  }
}

/* ===== INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Load quiz info and initial tab
  loadQuizInfo();
  loadParticipants();

  // Setup search listener
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", searchParticipants);
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
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);
}
