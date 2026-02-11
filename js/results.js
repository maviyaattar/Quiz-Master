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
let allParticipants = []; // Store all participant data
let filteredParticipants = []; // Store filtered data
let currentTab = 'participants'; // Track current tab
let searchQuery = ''; // Store search query

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

/**
 * Escapes text for use in JavaScript string context (onclick, etc.)
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeJsString(text) {
  return text
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/'/g, "\\'")     // Escape single quotes
    .replace(/"/g, '\\"')     // Escape double quotes
    .replace(/\n/g, '\\n')    // Escape newlines
    .replace(/\r/g, '\\r');   // Escape carriage returns
}

/* ===== NAVIGATION ===== */
/**
 * Navigate back to quiz details page
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

    // Update header information
    document.getElementById("quizTitle").innerText = sanitizeInput(q.title);
    document.getElementById("quizDesc").innerText = sanitizeInput(q.description);
    document.getElementById("quizCode").innerText = sanitizeInput(q.code);
    
    const statusBadge = document.getElementById("quizStatus");
    const status = sanitizeInput(q.status);
    statusBadge.innerText = status.toUpperCase();
    statusBadge.className = `status-badge ${status}`;
  } catch (err) {
    console.error("Error loading quiz info:", err);
    showAlert("error", "Failed to load quiz information");
  }
}

/* ===== SEARCH FUNCTIONALITY ===== */
/**
 * Setup search input listener
 */
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    
    // Show/hide clear button
    if (searchQuery) {
      clearBtn.style.display = 'block';
    } else {
      clearBtn.style.display = 'none';
    }
    
    // Apply search filter
    applySearch();
  });
}

/**
 * Apply search filter to current data
 */
function applySearch() {
  if (!searchQuery) {
    filteredParticipants = [...allParticipants];
  } else {
    filteredParticipants = allParticipants.filter(p => {
      const name = (p.name || '').toLowerCase();
      const rollNo = (p.rollNo || '').toLowerCase();
      const branch = (p.branch || '').toLowerCase();
      
      return name.includes(searchQuery) || 
             rollNo.includes(searchQuery) || 
             branch.includes(searchQuery);
    });
  }
  
  // Re-render current tab with filtered data
  renderCurrentTab();
}

/**
 * Clear search input
 */
function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  searchInput.value = '';
  searchQuery = '';
  clearBtn.style.display = 'none';
  
  applySearch();
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

/**
 * Render current tab with filtered data
 */
function renderCurrentTab() {
  if (currentTab === 'participants') {
    renderParticipants();
  } else if (currentTab === 'leaderboard') {
    renderLeaderboard();
  }
  // Summary tab doesn't use filtering
}

/* ===== PARTICIPANTS TAB ===== */
/**
 * Load participants list
 */
async function loadParticipants() {
  const container = document.getElementById("participants");
  container.innerHTML =
    '<div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div>';

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
    allParticipants = data || [];
    filteredParticipants = [...allParticipants];
    
    // Apply current search if any
    applySearch();
  } catch (err) {
    console.error("Error loading participants:", err);
    container.innerHTML =
      '<p class="error-message">Failed to load participants</p>';
  }
}

/**
 * Render participants table
 */
function renderParticipants() {
  const container = document.getElementById("participants");
  
  if (!filteredParticipants || filteredParticipants.length === 0) {
    container.innerHTML = searchQuery 
      ? '<p class="empty-message">No participants found matching your search</p>'
      : '<p class="empty-message">No participants yet</p>';
    return;
  }

  container.innerHTML = `
    <div class="table-container">
      <table class="results-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Branch</th>
            <th>Score</th>
            <th>Submission Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredParticipants.map(p => `
            <tr>
              <td class="participant-name">${escapeHtml(p.name)}</td>
              <td>${escapeHtml(p.rollNo)}</td>
              <td>${escapeHtml(p.branch || 'N/A')}</td>
              <td><strong>${p.score} pts</strong></td>
              <td>${formatDate(p.submittedAt)}</td>
              <td>
                <button 
                  class="pdf-btn" 
                  onclick="downloadPDF('${escapeJsString(p.rollNo)}')"
                  aria-label="Download PDF for ${escapeHtml(p.name)}"
                >
                  <i class="fa fa-download"></i> PDF
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/* ===== LEADERBOARD TAB ===== */
/**
 * Load leaderboard
 */
async function loadLeaderboard() {
  const container = document.getElementById("leaderboard");
  container.innerHTML =
    '<div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/leaderboard/${code}`);

    if (!response.ok) {
      throw new Error("Failed to load leaderboard");
    }

    const data = await response.json();
    
    // Map the data to include branch if available
    allParticipants = data.map(participant => ({
      ...participant,
      branch: participant.branch || 'N/A'
    }));
    
    filteredParticipants = [...allParticipants];
    
    // Apply current search if any
    applySearch();
  } catch (err) {
    console.error("Error loading leaderboard:", err);
    container.innerHTML =
      '<p class="error-message">Failed to load leaderboard</p>';
  }
}

/**
 * Render leaderboard
 */
function renderLeaderboard() {
  const container = document.getElementById("leaderboard");
  
  if (!filteredParticipants || filteredParticipants.length === 0) {
    container.innerHTML = searchQuery 
      ? '<p class="empty-message">No participants found matching your search</p>'
      : '<p class="empty-message">No results yet</p>';
    return;
  }

  container.innerHTML = filteredParticipants
    .map((u, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      const isTopThree = i < 3;
      const topClass = isTopThree ? ` rank-${i + 1}` : '';
      
      return `
        <div class="leaderboard-item${topClass}">
          <div class="rank-badge">${medal}</div>
          <div class="participant-info">
            <div class="participant-name-leader">${escapeHtml(u.name)}</div>
            <div class="participant-details">
              ${escapeHtml(u.rollNo)} ${u.branch ? `• ${escapeHtml(u.branch)}` : ''}
            </div>
          </div>
          <div class="score-badge">${u.score} pts</div>
        </div>
      `;
    })
    .join("");
}

/* ===== SUMMARY TAB ===== */
/**
 * Load quiz summary statistics
 */
async function loadSummary() {
  const container = document.getElementById("summary");
  container.innerHTML =
    '<div class="loading-skeleton"></div><div class="loading-skeleton"></div><div class="loading-skeleton"></div>';

  try {
    const response = await fetch(`${API}/api/quiz/summary/${code}`);

    if (!response.ok) {
      throw new Error("Failed to load summary");
    }

    const s = await response.json();

    // Also get quiz status
    const quizResponse = await fetch(`${API}/api/quiz/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    let quizStatus = 'unknown';
    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      quizStatus = quizData.status;
    }

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
            <div class="summary-value">${s.highest}</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon chart">
            <i class="fa fa-chart-line"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Average Score</div>
            <div class="summary-value">${s.average.toFixed(2)}</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon status">
            <i class="fa fa-info-circle"></i>
          </div>
          <div class="summary-content">
            <div class="summary-label">Quiz Status</div>
            <div class="summary-value status-text ${quizStatus}">${quizStatus.toUpperCase()}</div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error loading summary:", err);
    container.innerHTML =
      '<p class="error-message">Failed to load summary</p>';
  }
}

/* ===== PDF DOWNLOAD ===== */
/**
 * Download PDF for individual participant
 * @param {string} rollNo - Roll number of participant
 */
async function downloadPDF(rollNo) {
  try {
    // Sanitize rollNo to prevent injection
    const sanitizedRollNo = sanitizeInput(rollNo);
    
    showAlert('info', 'Generating PDF...');
    
    // Use the existing submit endpoint which generates PDFs
    // Note: The backend needs to implement the new endpoint for individual PDFs
    // For now, we'll show a message that this feature requires backend support
    const url = `${API}/api/quiz/participant-pdf/${encodeURIComponent(code)}/${encodeURIComponent(sanitizedRollNo)}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('PDF generation failed');
    }
    
    // Download the PDF
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `quiz-result-${sanitizedRollNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    
    showAlert('success', 'PDF downloaded successfully!');
  } catch (err) {
    console.error('Error downloading PDF:', err);
    showAlert('error', 'Failed to download PDF. Please try again.');
  }
}

/* ===== UTILITY FUNCTIONS ===== */
/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return 'N/A';
  }
}

/**
 * Show alert message
 * @param {string} type - Alert type (success, error, info)
 * @param {string} message - Message to display
 */
function showAlert(type, message) {
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
    info: { bg: '#dbeafe', text: '#0c2340', border: '#93c5fd' },
  };

  const color = colors[type] || colors.info;
  alert.style.backgroundColor = color.bg;
  alert.style.color = color.text;
  alert.style.borderLeft = `4px solid ${color.border}`;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };
  
  alert.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">
        ${icons[type] || icons.info}
      </span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;

  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => alert.remove(), 300);
  }, 4000);
}

/* ===== INITIALIZATION ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Load quiz info and initial tab
  loadQuizInfo();
  loadParticipants(); // Default tab
  
  // Setup search functionality
  setupSearch();
  
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
