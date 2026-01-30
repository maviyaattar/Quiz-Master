/* ============================================
   CREATE.JS - Create Test Page Logic
   Extracted from: create.html
   Maviya Attar - Quiz Master Platform
   ============================================ */

/* ===== CONFIGURATION ===== */
const API_BASE = "https://quiz-backend-production-4aaf.up.railway.app";
const token = localStorage.getItem("token");

// Redirect to auth if not authenticated
if (!token) {
  location.href = "auth.html";
}

/* ===== STATE MANAGEMENT ===== */
let questions = [];
let editIndex = null;
let isSubmitting = false;

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

/* ===== QUESTION MANAGEMENT: SAVE ===== */
/**
 * Save a new question or update existing question
 */
function saveQuestion() {
  const textInput = document.getElementById("questionText");
  const opt0Input = document.getElementById("opt0");
  const opt1Input = document.getElementById("opt1");
  const opt2Input = document.getElementById("opt2");
  const opt3Input = document.getElementById("opt3");

  const text = sanitizeInput(textInput.value.trim());
  const options = [
    sanitizeInput(opt0Input.value.trim()),
    sanitizeInput(opt1Input.value.trim()),
    sanitizeInput(opt2Input.value.trim()),
    sanitizeInput(opt3Input.value.trim()),
  ];
  const correctRadio = document.querySelector("input[name='correct']:checked");

  // Validation
  if (!text) {
    showAlert("error", "Please enter the question");
    return;
  }

  if (options.some((o) => !o)) {
    showAlert("error", "Please fill all options");
    return;
  }

  if (!correctRadio) {
    showAlert("error", "Please select the correct option");
    return;
  }

  const question = {
    text,
    options,
    correctIndex: Number(correctRadio.value),
  };

  // Update or add question
  if (editIndex !== null) {
    questions[editIndex] = question;
    editIndex = null;
    showAlert("success", "Question updated!");
  } else {
    questions.push(question);
    showAlert("success", "Question added!");
  }

  clearForm();
  renderQuestions();
}

/* ===== QUESTION MANAGEMENT: RENDER ===== */
/**
 * Render all questions in the list
 */
function renderQuestions() {
  const listContainer = document.getElementById("questionList");

  if (questions.length === 0) {
    listContainer.innerHTML =
      '<p style="color: var(--muted); text-align: center; padding: 20px;">No questions added yet</p>';
    return;
  }

  listContainer.innerHTML = questions
    .map((q, i) => {
      const correctLabel = String.fromCharCode(65 + q.correctIndex);
      return `
        <div class="question-item" role="article" aria-label="Question ${i + 1}">
          <div class="question-header">
            <strong>Q${i + 1}. ${escapeHtml(q.text)}</strong>
            <div class="question-actions">
              <i class="fa fa-pen" onclick="editQuestion(${i})" 
                 role="button" tabindex="0" aria-label="Edit question ${i + 1}"
                 title="Edit question"></i>
              <i class="fa fa-trash delete" onclick="deleteQuestion(${i})" 
                 role="button" tabindex="0" aria-label="Delete question ${i + 1}"
                 title="Delete question"></i>
            </div>
          </div>
          <div class="correct">
            Correct Option: <strong>${correctLabel}</strong>
          </div>
        </div>
      `;
    })
    .join("");
}

/* ===== QUESTION MANAGEMENT: EDIT ===== */
/**
 * Load a question for editing
 * @param {number} index - Index of question to edit
 */
function editQuestion(index) {
  const q = questions[index];
  const textInput = document.getElementById("questionText");
  const opt0Input = document.getElementById("opt0");
  const opt1Input = document.getElementById("opt1");
  const opt2Input = document.getElementById("opt2");
  const opt3Input = document.getElementById("opt3");

  textInput.value = q.text;
  opt0Input.value = q.options[0];
  opt1Input.value = q.options[1];
  opt2Input.value = q.options[2];
  opt3Input.value = q.options[3];

  document.querySelector(
    `input[name='correct'][value='${q.correctIndex}']`
  ).checked = true;

  editIndex = index;

  // Scroll to form
  textInput.scrollIntoView({ behavior: "smooth", block: "center" });
  textInput.focus();

  showAlert("info", `Editing Question ${index + 1}`);
}

/* ===== QUESTION MANAGEMENT: DELETE ===== */
/**
 * Delete a question from the list
 * @param {number} index - Index of question to delete
 */
function deleteQuestion(index) {
  showConfirmDialog(
    "Are you sure you want to delete this question?",
    () => {
      questions.splice(index, 1);
      if (editIndex === index) {
        editIndex = null;
        clearForm();
      }
      renderQuestions();
      showAlert("success", "Question deleted!");
    }
  );
}

/* ===== FORM MANAGEMENT ===== */
/**
 * Clear all form inputs
 */
function clearForm() {
  const textInput = document.getElementById("questionText");
  const opt0Input = document.getElementById("opt0");
  const opt1Input = document.getElementById("opt1");
  const opt2Input = document.getElementById("opt2");
  const opt3Input = document.getElementById("opt3");

  textInput.value = "";
  opt0Input.value = "";
  opt1Input.value = "";
  opt2Input.value = "";
  opt3Input.value = "";

  document
    .querySelectorAll("input[name='correct']")
    .forEach((r) => (r.checked = false));

  editIndex = null;
}

/* ===== QUIZ CREATION ===== */
/**
 * Create the test via API
 */
async function createTest() {
  if (isSubmitting) return;

  const titleInput = document.getElementById("testTitle");
  const descInput = document.getElementById("testDesc");
  const durationInput = document.getElementById("testDuration");

  const title = sanitizeInput(titleInput.value.trim());
  const description = sanitizeInput(descInput.value.trim());
  const durationMin = Number(durationInput.value);

  // Validation
  if (!title) {
    showAlert("error", "Please enter test title");
    return;
  }

  if (!description) {
    showAlert("error", "Please enter test description");
    return;
  }

  if (!durationMin || durationMin <= 0) {
    showAlert("error", "Please enter valid duration (in minutes)");
    return;
  }

  if (questions.length === 0) {
    showAlert("error", "Please add at least one question");
    return;
  }

  isSubmitting = true;

  try {
    const payload = {
      title,
      description,
      duration: durationMin * 60 + 20, // Convert minutes to seconds and add 20 second buffer
      questions,
    };

    const response = await fetch(`${API_BASE}/api/quiz/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert("error", data.msg || "Failed to create test");
      isSubmitting = false;
      return;
    }

    showAlert("success", "🎉 Test created successfully!");

    // Redirect to dashboard after brief delay
    setTimeout(() => {
      location.href = "dashboard.html";
    }, 1000);
  } catch (err) {
    console.error("Error creating test:", err);
    showAlert("error", "Server error. Please try again.");
    isSubmitting = false;
  }
}

/* ===== UI UTILITIES ===== */
/**
 * Display alert messages with styling
 * @param {string} type - 'success', 'error', 'info'
 * @param {string} message - Message to display
 */
function showAlert(type, message) {
  // Create or reuse alert container
  let alertContainer = document.getElementById("alertContainer");
  if (!alertContainer) {
    alertContainer = document.createElement("div");
    alertContainer.id = "alertContainer";
    alertContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    `;
    document.body.appendChild(alertContainer);
  }

  const alert = document.createElement("div");
  alert.style.cssText = `
    padding: 14px 18px;
    border-radius: 12px;
    margin-bottom: 10px;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  `;

  const colors = {
    success: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    error: { bg: "#fee2e2", text: "#7f1d1d", border: "#fca5a5" },
    warning: { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
    danger: { bg: "#fee2e2", text: "#7f1d1d", border: "#ef4444" },
    info: { bg: "#dbeafe", text: "#0c2340", border: "#93c5fd" },
  };

  const color = colors[type] || colors.info;
  alert.style.backgroundColor = color.bg;
  alert.style.color = color.text;
  alert.style.borderLeft = `4px solid ${color.border}`;

  alert.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">
        ${type === "success" ? "✓" : type === "error" || type === "danger" ? "✕" : type === "warning" ? "⚠" : "ℹ"}
      </span>
      <span>${escapeHtml(message)}</span>
    </div>
  `;

  alertContainer.appendChild(alert);

  // Auto-remove alert after 4 seconds
  setTimeout(() => {
    alert.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => alert.remove(), 300);
  }, 4000);
}

/* ===== EVENT LISTENERS ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Allow Enter key to save question in textarea
  const questionTextInput = document.getElementById("questionText");
  if (questionTextInput) {
    questionTextInput.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        saveQuestion();
      }
    });
  }

  // Keyboard navigation for question actions
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (editIndex !== null) {
        clearForm();
      }
    }
  });
});

// Add animation styles to document
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
