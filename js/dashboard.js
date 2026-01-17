/* ==========================================
   DASHBOARD PAGE JAVASCRIPT
   ========================================== */

// Configuration
const API = "https://quiz-backend-production-4aaf.up.railway.app";
const token = localStorage.getItem("token");

// Check authentication
if (!token) {
  location.href = "auth.html";
}

/* ==========================================
   LOAD QUIZZES FROM API
   ========================================== */
async function loadQuizzes() {
  const grid = document.getElementById("quizGrid");
  
  // Show loading state
  grid.innerHTML = '<div class="empty"><h3>Loading quizzes...</h3></div>';
  
  try {
    const res = await fetch(`${API}/api/quiz/my`, {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch quizzes');
    }

    const quizzes = await res.json();
    grid.innerHTML = "";

    // Show empty state if no quizzes
    if (quizzes.length === 0) {
      grid.innerHTML = `
        <div class="empty">
          <h3>No tests yet</h3>
          <p>Create your first quiz to get started 🚀</p>
        </div>`;
      return;
    }

    // Render quiz cards
    quizzes.forEach(q => {
      const div = document.createElement("div");
      div.className = "quiz-card";
      div.onclick = () => openTest(q.code);

      // Sanitize content
      const title = sanitizeHTML(q.title);
      const description = sanitizeHTML(q.description || "No description");
      const status = sanitizeHTML(q.status);

      div.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
        <span class="status ${status}">
          ${status.toUpperCase()}
        </span>
      `;

      grid.appendChild(div);
    });

  } catch (err) {
    console.error('Error loading quizzes:', err);
    grid.innerHTML = `
      <div class="empty">
        <h3>Failed to load quizzes</h3>
        <p>Please refresh the page to try again</p>
      </div>`;
  }
}

/* ==========================================
   OPEN TEST DETAILS
   ========================================== */
function openTest(code) {
  location.href = "test.html?code=" + encodeURIComponent(code);
}

/* ==========================================
   SECURITY - SANITIZE HTML
   ========================================== */
function sanitizeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ==========================================
   INITIALIZE
   ========================================== */
loadQuizzes();
