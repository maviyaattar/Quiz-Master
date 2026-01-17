/* ============================================
   JOIN.JS - Join Quiz Page Logic
   Extracted from: join.html
   Maviya Attar - Quiz Master Platform
   ============================================ */

/* ===== CONFIGURATION ===== */
const API = "https://quiz-backend-production-4aaf.up.railway.app";

/* ===== STATE MANAGEMENT ===== */
let verifiedCode = null;

/* ===== NAVIGATION ===== */
/**
 * Navigate back to home page
 */
function goToHome() {
  location.href = "index.html";
}

/**
 * Go back to step 1 (code entry)
 */
function backToStep1() {
  document.getElementById("step1").style.display = "block";
  document.getElementById("step2").style.display = "none";
  verifiedCode = null;
  showMessage("", "info");
}

/* ===== STEP 1: VERIFY QUIZ CODE ===== */
/**
 * Verify the quiz code before showing the form
 */
async function verifyCode() {
  const codeInput = document.getElementById("code");
  const code = sanitizeInput(codeInput.value.trim().toUpperCase());
  const btn = event.target;

  // Clear previous message
  showMessage("", "info");

  // Validation
  if (!code) {
    showMessage("Please enter a quiz code", "error");
    return;
  }

  if (!isValidCode(code)) {
    showMessage("Invalid quiz code format (3-10 alphanumeric characters)", "error");
    return;
  }

  // Disable button during verification
  btn.disabled = true;
  btn.classList.add("loading");
  showMessage("Verifying quiz code...", "info");

  try {
    // Check if quiz exists and is active
    const response = await fetch(`${API}/api/quiz/join/${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rollNo: "VERIFY" }), // Dummy request to check status
    });

    const data = await response.json();

    btn.disabled = false;
    btn.classList.remove("loading");

    if (!response.ok) {
      showMessage(data.msg || "Quiz not found. Please check the code.", "error");
      return;
    }

    // Check quiz status
    if (data.status === "ended") {
      showMessage("❌ This quiz has already ended", "error");
      return;
    }

    // For both "created" and "allowed" status, proceed to step 2
    if (data.status === "created" || data.status === "allowed") {
      // Code is valid
      verifiedCode = code;
      showMessage("✓ Quiz code verified!", "success");
      
      // Move to step 2
      setTimeout(() => {
        document.getElementById("step1").style.display = "none";
        document.getElementById("step2").style.display = "block";
        document.getElementById("quizCodeDisplay").innerHTML = 
          `<strong>Quiz Code:</strong> <span class="code-badge">${escapeHtml(code)}</span>`;
        document.getElementById("name").focus();
        showMessage("", "info");
      }, 800);
      return;
    }

    showMessage("Unexpected response from server", "warning");
  } catch (err) {
    console.error("Error verifying quiz code:", err);
    showMessage("Unable to connect to server. Please try again.", "error");
    btn.disabled = false;
    btn.classList.remove("loading");
  }
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

/* ===== VALIDATION ===== */
/**
 * Validate quiz code format
 * @param {string} code - Quiz code to validate
 * @returns {boolean} True if valid
 */
function isValidCode(code) {
  // Code should be alphanumeric and 3-10 characters
  return /^[A-Z0-9]{3,10}$/.test(code.trim().toUpperCase());
}

/**
 * Validate user name
 * @param {string} name - User name to validate
 * @returns {boolean} True if valid
 */
function isValidName(name) {
  return name.trim().length > 0 && name.trim().length <= 50;
}

/**
 * Validate roll number
 * @param {string} roll - Roll number to validate
 * @returns {boolean} True if valid
 */
function isValidRoll(roll) {
  return roll.trim().length > 0 && roll.trim().length <= 20;
}

/**
 * Validate branch name
 * @param {string} branch - Branch name to validate
 * @returns {boolean} True if valid
 */
function isValidBranch(branch) {
  return branch.trim().length > 0 && branch.trim().length <= 50;
}

/* ===== MESSAGE DISPLAY ===== */
/**
 * Display a message to the user
 * @param {string} message - Message text
 * @param {string} type - Message type: 'success', 'error', 'warning', 'info'
 */
function showMessage(message, type = "info") {
  const msgElement = document.getElementById("msg");

  // Remove all message classes
  msgElement.className = "msg";

  // Set message content with sanitization
  msgElement.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">
        ${
          type === "success"
            ? "✓"
            : type === "error"
              ? "✕"
              : type === "warning"
                ? "⚠"
                : "ℹ"
        }
      </span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;

  // Add appropriate class and show
  msgElement.classList.add("visible", type);

  // Auto-hide success messages after 3 seconds
  if (type === "success") {
    setTimeout(() => {
      msgElement.classList.remove("visible");
    }, 3000);
  }
}

/* ===== QUIZ JOINING ===== */
/**
 * Join a quiz with provided credentials
 */
async function joinQuiz() {
  // Use verified code from step 1
  if (!verifiedCode) {
    showMessage("Please verify quiz code first", "error");
    backToStep1();
    return;
  }

  // Get input elements
  const nameInput = document.getElementById("name");
  const rollInput = document.getElementById("roll");
  const branchInput = document.getElementById("branch");
  const btn = event.target;

  // Get and sanitize inputs
  const code = verifiedCode;
  const name = sanitizeInput(nameInput.value.trim());
  const rollNo = sanitizeInput(rollInput.value.trim());
  const branch = sanitizeInput(branchInput.value.trim());

  // Clear previous message
  showMessage("", "info");

  // ===== VALIDATION =====
  if (!name || !rollNo || !branch) {
    showMessage("Please fill all fields", "error");
    return;
  }

  if (!isValidName(name)) {
    showMessage("Invalid name (max 50 characters)", "error");
    return;
  }

  if (!isValidRoll(rollNo)) {
    showMessage("Invalid roll number (max 20 characters)", "error");
    return;
  }

  if (!isValidBranch(branch)) {
    showMessage("Invalid branch (max 50 characters)", "error");
    return;
  }

  // Disable button during submission
  btn.disabled = true;
  btn.classList.add("loading");
  showMessage("Joining quiz...", "info");

  try {
    // ===== API REQUEST =====
    const response = await fetch(`${API}/api/quiz/join/${code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rollNo }),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.msg || "Unable to join quiz", "error");
      btn.disabled = false;
      btn.classList.remove("loading");
      return;
    }

    // ===== STATUS CHECKING =====
    if (data.status === "ended") {
      showMessage("❌ This quiz has already ended", "error");
      btn.disabled = false;
      btn.classList.remove("loading");
      return;
    }

    // For both "created" and "allowed" status, proceed to attempt page
    // The waiting screen in attempt.html will handle the "not started" state
    if (data.status === "created" || data.status === "allowed") {
      showMessage("✓ Joining quiz...", "success");

      // Store joiner data in localStorage
      const joinerData = {
        code: sanitizeInput(code),
        name: sanitizeInput(name),
        rollNo: sanitizeInput(rollNo),
        branch: sanitizeInput(branch),
      };

      localStorage.setItem("joiner", JSON.stringify(joinerData));

      // Redirect to attempt page after brief delay
      setTimeout(() => {
        location.href = `attempt.html?code=${encodeURIComponent(code)}`;
      }, 500);
      return;
    }

    // Unknown status
    showMessage("Unexpected response from server", "warning");
    btn.disabled = false;
    btn.classList.remove("loading");
  } catch (err) {
    console.error("Error joining quiz:", err);
    showMessage("Server error. Please check your connection and try again.", "error");
    btn.disabled = false;
    btn.classList.remove("loading");
  }
}

/* ===== EVENT LISTENERS ===== */
document.addEventListener("DOMContentLoaded", () => {
  const codeInput = document.getElementById("code");
  const nameInput = document.getElementById("name");
  const rollInput = document.getElementById("roll");
  const branchInput = document.getElementById("branch");
  const btn = document.querySelector(".btn");

  // Auto-format code input to uppercase
  if (codeInput) {
    codeInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.toUpperCase();
    });

    // Allow Enter key to submit
    codeInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        joinQuiz();
      }
    });
  }

  // Allow Enter key on all inputs
  const inputs = [nameInput, rollInput, branchInput];
  inputs.forEach((input) => {
    if (input) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          joinQuiz();
        }
      });
    }
  });

  // Button click handler
  if (btn) {
    btn.addEventListener("click", joinQuiz);
  }

  // Auto-focus first input
  if (codeInput) {
    codeInput.focus();
  }

  // Add animation styles
  addAnimationStyles();
});

/* ===== UTILITIES: ANIMATIONS ===== */
/**
 * Add required animation styles to document
 */
function addAnimationStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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

/* ===== FORM INITIALIZATION ===== */
// Pre-populate from URL parameters if available
function loadFromUrl() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");

  if (code && isValidCode(code)) {
    document.getElementById("code").value = code.toUpperCase();
    document.getElementById("name").focus();
  }
}

// Initialize on load
window.addEventListener("load", loadFromUrl);
