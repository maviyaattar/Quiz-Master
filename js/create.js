/* ============================================
   CREATE.JS - Create Test Page Logic
   Extracted from: create.html
   Maviya Attar - Quiz Master Platform
   ============================================ */

/* ===== CONFIGURATION ===== */
const API_BASE = "https://portfolio-backend-api-8me4.onrender.com";
const token = localStorage.getItem("token");

// Redirect to auth if not authenticated
if (!token) {
  location.href = "auth.html";
}

/* ===== STATE MANAGEMENT ===== */
let questions = [];
let editIndex = null;
let isSubmitting = false;
let logoUrl = null; // Store uploaded logo URL
let currentMode = 'manual'; // Track current mode: 'manual' or 'ai'
let aiQuestions = [];
let aiEditIndex = null;
let aiLogoUrl = null; // Store uploaded logo URL for AI mode

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

            <div style="display:flex; gap:8px; flex-shrink:0;">

              <button 
                onclick="editQuestion(${i})"
                style="
                  padding:6px 12px;
                  border-radius:8px;
                  font-size:13px;
                  font-weight:600;
                  border:1px solid #2563eb;
                  background:#e0f2fe;
                  color:#2563eb;
                  cursor:pointer;
                  transition:0.2s ease;
                "
                onmouseover="this.style.background='#2563eb';this.style.color='white';"
                onmouseout="this.style.background='#e0f2fe';this.style.color='#2563eb';"
              >
                Edit
              </button>

              <button 
                onclick="deleteQuestion(${i})"
                style="
                  padding:6px 12px;
                  border-radius:8px;
                  font-size:13px;
                  font-weight:600;
                  border:1px solid #dc2626;
                  background:#fee2e2;
                  color:#dc2626;
                  cursor:pointer;
                  transition:0.2s ease;
                "
                onmouseover="this.style.background='#dc2626';this.style.color='white';"
                onmouseout="this.style.background='#fee2e2';this.style.color='#dc2626';"
              >
                Delete
              </button>

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
  const orgNameInput = document.getElementById("orgName");
  const negativeMarkingInput = document.getElementById("negativeMarking");

  const title = sanitizeInput(titleInput.value.trim());
  const description = sanitizeInput(descInput.value.trim());
  const durationMin = Number(durationInput.value);
  const orgName = sanitizeInput(orgNameInput.value.trim());
  const negativeMarking = negativeMarkingInput.checked;

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
      orgName: orgName || undefined, // Include only if provided
      logoUrl: logoUrl || undefined, // Include only if uploaded
      negativeMarking: negativeMarking, // Include checkbox value
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

/* ===== LOGO UPLOAD HANDLING ===== */
/**
 * Handle logo file upload
 * @param {Event} event - File input change event
 * @param {string} mode - 'manual' or 'ai'
 */
async function handleLogoUpload(event, mode = 'manual') {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showAlert('error', 'Please upload a valid image file');
    event.target.value = ''; // Clear the file input
    return;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    showAlert('error', 'Logo file size must be less than 5MB');
    event.target.value = ''; // Clear the file input
    return;
  }

  // Determine element IDs based on mode
  const statusId = mode === 'ai' ? 'aiLogoUploadStatus' : 'logoUploadStatus';
  const previewId = mode === 'ai' ? 'aiLogoPreview' : 'logoPreview';
  const previewImgId = mode === 'ai' ? 'aiLogoPreviewImage' : 'logoPreviewImage';

  // Show uploading status
  const statusEl = document.getElementById(statusId);
  statusEl.className = 'upload-status uploading';
  statusEl.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Uploading logo...';

  try {
    // Create form data
    const formData = new FormData();
    formData.append('logo', file);

    // Upload to backend
    const response = await fetch(`${API_BASE}/api/upload-logo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Failed to upload logo');
    }

    // Store the logo URL
    if (mode === 'ai') {
      aiLogoUrl = data.url;
    } else {
      logoUrl = data.url;
    }

    // Show preview
    const previewEl = document.getElementById(previewId);
    const previewImg = document.getElementById(previewImgId);
    previewImg.src = data.url;
    previewEl.style.display = 'inline-block';

    // Show success status
    statusEl.className = 'upload-status success';
    statusEl.innerHTML = '<i class="fa fa-check"></i> Logo uploaded successfully';

    // Clear status after 3 seconds
    setTimeout(() => {
      statusEl.innerHTML = '';
      statusEl.className = 'upload-status';
    }, 3000);

    showAlert('success', 'Logo uploaded successfully!');
  } catch (err) {
    console.error('Error uploading logo:', err);
    
    // Show error status
    statusEl.className = 'upload-status error';
    statusEl.innerHTML = '<i class="fa fa-times"></i> Upload failed';

    // Clear status after 3 seconds
    setTimeout(() => {
      statusEl.innerHTML = '';
      statusEl.className = 'upload-status';
    }, 3000);

    showAlert('error', err.message || 'Failed to upload logo. Please try again.');
    
    // Clear the file input
    event.target.value = '';
  }
}

/**
 * Remove uploaded logo
 * @param {string} mode - 'manual' or 'ai'
 */
function removeLogo(mode = 'manual') {
  // Determine element IDs based on mode
  const previewId = mode === 'ai' ? 'aiLogoPreview' : 'logoPreview';
  const fileInputId = mode === 'ai' ? 'aiLogoUpload' : 'logoUpload';
  const statusId = mode === 'ai' ? 'aiLogoUploadStatus' : 'logoUploadStatus';

  // Clear the logo URL
  if (mode === 'ai') {
    aiLogoUrl = null;
  } else {
    logoUrl = null;
  }

  // Hide preview
  const previewEl = document.getElementById(previewId);
  previewEl.style.display = 'none';

  // Clear the file input
  const fileInput = document.getElementById(fileInputId);
  fileInput.value = '';

  // Clear status
  const statusEl = document.getElementById(statusId);
  statusEl.innerHTML = '';
  statusEl.className = 'upload-status';

  showAlert('info', 'Logo removed');
}

/* ===== MODE SWITCHING ===== */
/**
 * Switch between manual and AI modes
 * @param {string} mode - 'manual' or 'ai'
 */
function switchMode(mode) {
  currentMode = mode;
  
  // Update button states
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.mode === mode) {
      btn.classList.add('active');
    }
  });
  
  // Update section visibility
  const manualSection = document.getElementById('manualMode');
  const aiSection = document.getElementById('aiMode');
  
  if (mode === 'manual') {
    manualSection.classList.add('active');
    aiSection.classList.remove('active');
  } else {
    manualSection.classList.remove('active');
    aiSection.classList.add('active');
  }
}

/* ===== AI QUESTION GENERATION ===== */
/**
 * Generate questions using AI (via backend)
 */
async function generateWithAI() {
  const titleInput = document.getElementById('aiTestTitle');
  const difficultyInput = document.getElementById('difficultyLevel');
  const numQuestionsInput = document.getElementById('numQuestions');
  const topicInput = document.getElementById('topicPrompt');
  
  const title = sanitizeInput(titleInput.value.trim());
  const difficulty = difficultyInput.value;
  const numQuestions = Number(numQuestionsInput.value);
  const topic = sanitizeInput(topicInput.value.trim());
  
  // Validation
  if (!title) {
    showAlert('error', 'Please enter test title');
    return;
  }
  
  if (!topic) {
    showAlert('error', 'Please enter a topic or prompt for AI generation');
    return;
  }
  
  if (!numQuestions || numQuestions < 1 || numQuestions > 50) {
    showAlert('error', 'Please enter a valid number of questions (1-50)');
    return;
  }
  
  // Show loading state
  const generateBtn = document.getElementById('generateBtn');
  const originalText = generateBtn.innerHTML;
  generateBtn.disabled = true;
  generateBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Generating questions with AI...';
  
  try {
    // Call backend API endpoint
    const response = await fetch(`${API_BASE}/api/quiz/generate-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic: topic,
        difficulty: difficulty,
        numQuestions: numQuestions
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Failed to generate questions');
    }
    
    const data = await response.json();
    
    // Validate response
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('No questions were generated');
    }
    
    // Validate question structure
    for (const q of data.questions) {
      if (!q.text || !Array.isArray(q.options) || q.options.length !== 4 || 
          typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
        throw new Error('Invalid question format received');
      }
    }
    
    // Store generated questions
    aiQuestions = data.questions;
    
    // Show questions
    renderAIQuestions();
    
    // Show question list card and manual add card
    document.getElementById('aiQuestionsCard').style.display = 'block';
    document.getElementById('aiManualQuestionCard').style.display = 'block';
    document.getElementById('aiCreateAction').style.display = 'block';
    
    showAlert('success', `🎉 Successfully generated ${data.questions.length} questions!`);
    
    // Scroll to questions
    document.getElementById('aiQuestionsCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
  } catch (err) {
    console.error('Error generating questions:', err);
    let errorMsg = 'Failed to generate questions. ';
    
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      errorMsg += 'Please check your connection and try again.';
    } else if (err.message.includes('401') || err.message.includes('authentication')) {
      errorMsg += 'Please log in again.';
    } else {
      errorMsg += err.message || 'Please try again.';
    }
    
    showAlert('error', errorMsg);
  } finally {
    // Restore button
    generateBtn.disabled = false;
    generateBtn.innerHTML = originalText;
  }
}

/**
 * Render AI-generated questions
 */

function renderAIQuestions() {
  const listContainer = document.getElementById('aiQuestionList');
  
  if (aiQuestions.length === 0) {
    listContainer.innerHTML =
      '<p style="color: var(--muted); text-align: center; padding: 20px;">No questions generated yet</p>';
    return;
  }
  
  listContainer.innerHTML = aiQuestions
    .map((q, i) => {
      return `
        <div class="ai-question-item" role="article" aria-label="Question ${i + 1}">
          <div class="question-header">
            <strong>Q${i + 1}. ${escapeHtml(q.text)}</strong>

            <div style="display:flex; gap:8px; flex-shrink:0;">

              <button 
                onclick="editAIQuestion(${i})"
                style="
                  padding:6px 12px;
                  border-radius:8px;
                  font-size:13px;
                  font-weight:600;
                  border:1px solid #2563eb;
                  background:#e0f2fe;
                  color:#2563eb;
                  cursor:pointer;
                  transition:0.2s ease;
                "
                onmouseover="this.style.background='#2563eb';this.style.color='white';"
                onmouseout="this.style.background='#e0f2fe';this.style.color='#2563eb';"
              >
                Edit
              </button>

              <button 
                onclick="deleteAIQuestion(${i})"
                style="
                  padding:6px 12px;
                  border-radius:8px;
                  font-size:13px;
                  font-weight:600;
                  border:1px solid #dc2626;
                  background:#fee2e2;
                  color:#dc2626;
                  cursor:pointer;
                  transition:0.2s ease;
                "
                onmouseover="this.style.background='#dc2626';this.style.color='white';"
                onmouseout="this.style.background='#fee2e2';this.style.color='#dc2626';"
              >
                Delete
              </button>

            </div>
          </div>

          <div class="ai-question-options">
            ${q.options.map((opt, idx) => `
              <div class="ai-question-option ${idx === q.correctIndex ? 'correct' : ''}">
                ${String.fromCharCode(65 + idx)}. ${escapeHtml(opt)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    })
    .join('');
}
/**
 * Edit an AI-generated question
 * @param {number} index - Index of question to edit
 */
function editAIQuestion(index) {
  const q = aiQuestions[index];
  const textInput = document.getElementById('aiQuestionText');
  const opt0Input = document.getElementById('aiOpt0');
  const opt1Input = document.getElementById('aiOpt1');
  const opt2Input = document.getElementById('aiOpt2');
  const opt3Input = document.getElementById('aiOpt3');
  
  textInput.value = q.text;
  opt0Input.value = q.options[0];
  opt1Input.value = q.options[1];
  opt2Input.value = q.options[2];
  opt3Input.value = q.options[3];
  
  document.querySelector(`input[name='aiCorrect'][value='${q.correctIndex}']`).checked = true;
  
  aiEditIndex = index;
  
  // Scroll to form
  textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  textInput.focus();
  
  showAlert('info', `Editing Question ${index + 1}`);
}

/**
 * Delete an AI-generated question
 * @param {number} index - Index of question to delete
 */
function deleteAIQuestion(index) {
  showConfirmDialog(
    'Are you sure you want to delete this question?',
    () => {
      aiQuestions.splice(index, 1);
      if (aiEditIndex === index) {
        aiEditIndex = null;
        clearAIForm();
      }
      renderAIQuestions();
      showAlert('success', 'Question deleted!');
      
      // Hide create button if no questions left
      if (aiQuestions.length === 0) {
        document.getElementById('aiCreateAction').style.display = 'none';
      }
    }
  );
}

/**
 * Save a manually added question in AI mode
 */
function saveAIQuestion() {
  const textInput = document.getElementById('aiQuestionText');
  const opt0Input = document.getElementById('aiOpt0');
  const opt1Input = document.getElementById('aiOpt1');
  const opt2Input = document.getElementById('aiOpt2');
  const opt3Input = document.getElementById('aiOpt3');
  
  const text = sanitizeInput(textInput.value.trim());
  const options = [
    sanitizeInput(opt0Input.value.trim()),
    sanitizeInput(opt1Input.value.trim()),
    sanitizeInput(opt2Input.value.trim()),
    sanitizeInput(opt3Input.value.trim()),
  ];
  const correctRadio = document.querySelector("input[name='aiCorrect']:checked");
  
  // Validation
  if (!text) {
    showAlert('error', 'Please enter the question');
    return;
  }
  
  if (options.some(o => !o)) {
    showAlert('error', 'Please fill all options');
    return;
  }
  
  if (!correctRadio) {
    showAlert('error', 'Please select the correct option');
    return;
  }
  
  const question = {
    text,
    options,
    correctIndex: Number(correctRadio.value),
  };
  
  // Update or add question
  if (aiEditIndex !== null) {
    aiQuestions[aiEditIndex] = question;
    aiEditIndex = null;
    showAlert('success', 'Question updated!');
  } else {
    aiQuestions.push(question);
    showAlert('success', 'Question added!');
  }
  
  clearAIForm();
  renderAIQuestions();
  
  // Show create button
  document.getElementById('aiCreateAction').style.display = 'block';
}

/**
 * Clear AI question form
 */
function clearAIForm() {
  const textInput = document.getElementById('aiQuestionText');
  const opt0Input = document.getElementById('aiOpt0');
  const opt1Input = document.getElementById('aiOpt1');
  const opt2Input = document.getElementById('aiOpt2');
  const opt3Input = document.getElementById('aiOpt3');
  
  textInput.value = '';
  opt0Input.value = '';
  opt1Input.value = '';
  opt2Input.value = '';
  opt3Input.value = '';
  
  document.querySelectorAll("input[name='aiCorrect']").forEach(r => r.checked = false);
  
  aiEditIndex = null;
}

/**
 * Create test from AI mode
 */
async function createAITest() {
  if (isSubmitting) return;
  
  const titleInput = document.getElementById('aiTestTitle');
  const descInput = document.getElementById('aiTestDesc');
  const durationInput = document.getElementById('aiTestDuration');
  const orgNameInput = document.getElementById('aiOrgName');
  const negativeMarkingInput = document.getElementById('aiNegativeMarking');
  
  const title = sanitizeInput(titleInput.value.trim());
  const description = sanitizeInput(descInput.value.trim());
  const durationMin = Number(durationInput.value);
  const orgName = sanitizeInput(orgNameInput.value.trim());
  const negativeMarking = negativeMarkingInput.checked;
  
  // Validation
  if (!title) {
    showAlert('error', 'Please enter test title');
    return;
  }
  
  if (!description) {
    showAlert('error', 'Please enter test description');
    return;
  }
  
  if (!durationMin || durationMin <= 0) {
    showAlert('error', 'Please enter valid duration (in minutes)');
    return;
  }
  
  if (aiQuestions.length === 0) {
    showAlert('error', 'Please generate or add at least one question');
    return;
  }
  
  isSubmitting = true;
  
  try {
    const payload = {
      title,
      description,
      duration: durationMin * 60 + 20,
      questions: aiQuestions,
      orgName: orgName || undefined,
      logoUrl: aiLogoUrl || undefined,
      negativeMarking: negativeMarking,
    };
    
    const response = await fetch(`${API_BASE}/api/quiz/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      showAlert('error', data.msg || 'Failed to create test');
      isSubmitting = false;
      return;
    }
    
    showAlert('success', '🎉 Test created successfully!');
    
    // Redirect to dashboard after brief delay
    setTimeout(() => {
      location.href = 'dashboard.html';
    }, 1000);
  } catch (err) {
    console.error('Error creating test:', err);
    showAlert('error', 'Server error. Please try again.');
    isSubmitting = false;
  }
}
