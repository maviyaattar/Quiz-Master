/* ============================================
   PROFILE.JS - User Profile Page Logic
   Extracted from: profile.html
   Maviya Attar - Quiz Master Platform
   ============================================ */

/* ===== CONFIGURATION ===== */
const API = "https://quiz-backend-production-4aaf.up.railway.app";
const token = localStorage.getItem("token");

// Redirect to auth if not authenticated
if (!token) {
  location.href = "auth.html";
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

/* ===== PROFILE LOADING ===== */
/**
 * Load user profile from API
 */
async function loadProfile() {
  try {
    const response = await fetch(`${API}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const user = await response.json();

    // Update profile information with sanitized data
    const nameElement = document.getElementById("name");
    const emailElement = document.getElementById("email");
    const avatarElement = document.getElementById("avatar");

    nameElement.innerText = sanitizeInput(user.name || "User");
    emailElement.innerText = sanitizeInput(user.email || "");
    avatarElement.innerText = (user.name || "U").charAt(0).toUpperCase();

    // Remove skeleton loader styling if present
    nameElement.classList.remove("skeleton");
    emailElement.classList.remove("skeleton");
    avatarElement.classList.remove("skeleton");
  } catch (err) {
    console.error("Error loading profile:", err);
    const nameElement = document.getElementById("name");
    nameElement.innerText = "Failed to load profile";
    nameElement.style.color = "var(--danger)";

    // Provide user feedback
    showErrorNotification("Unable to load your profile. Please try again.");
  }
}

/* ===== AUTHENTICATION: LOGOUT ===== */
/**
 * Handle user logout
 */
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    try {
      // Clear all local storage data
      localStorage.clear();

      // Clear session storage if used
      sessionStorage.clear();

      // Redirect to auth page
      location.href = "auth.html";
    } catch (err) {
      console.error("Error during logout:", err);
      // Force redirect even if error occurs
      window.location.href = "auth.html";
    }
  }
}

/* ===== UI UTILITIES ===== */
/**
 * Show error notification
 * @param {string} message - Error message to display
 */
function showErrorNotification(message) {
  const container =
    document.getElementById("notificationContainer") ||
    createNotificationContainer();
  const notification = document.createElement("div");

  notification.style.cssText = `
    padding: 14px 18px;
    background: #fee2e2;
    color: #7f1d1d;
    border-radius: 8px;
    border-left: 4px solid #ef4444;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fa fa-exclamation-circle"></i>
      <span>${sanitizeInput(message)}</span>
    </div>
  `;

  container.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Create notification container if it doesn't exist
 * @returns {HTMLElement} The notification container
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
  // Load profile data
  loadProfile();

  // Set up logout button
  const logoutBtn = document.querySelector(".logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Add animation styles
  addAnimationStyles();

  // Handle keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + L for logout
    if ((e.ctrlKey || e.metaKey) && e.key === "l") {
      e.preventDefault();
      logout();
    }
  });
});

/* ===== UTILITIES: ANIMATIONS ===== */
/**
 * Add animation styles to document
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

/* ===== EVENT HANDLING ===== */
// Handle navigation
document.addEventListener("DOMContentLoaded", () => {
  // Make bottom nav links work properly
  const bottomNavLinks = document.querySelectorAll(".bottom-nav a");

  bottomNavLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Update active state
      bottomNavLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });

    // Ensure current page is marked as active
    if (link.getAttribute("href") === "profile.html") {
      link.classList.add("active");
    }
  });
});
