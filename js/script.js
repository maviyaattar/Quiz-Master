/* ==========================================
   QUIZ MASTER - AUTHENTICATION SCRIPT
   Author: Maviya Attar
   ========================================== */

// Configuration
const API="https://quiz-backend-production-4aaf.up.railway.app";

/* ==========================================
   SECURITY - INPUT SANITIZATION
   ========================================== */
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/* ==========================================
   AUTH SWITCH FUNCTION
   ========================================== */
function switchAuth(type){
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  
  if (!loginForm || !registerForm) return;
  
  loginForm.style.display = type === "login" ? "block" : "none";
  registerForm.style.display = type === "register" ? "block" : "none";

  loginTab.classList.toggle("active", type === "login");
  registerTab.classList.toggle("active", type === "register");
}

/* ==========================================
   LOGIN FUNCTION
   ========================================== */
async function login(e){
  e.preventDefault();
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const msg = document.getElementById('msg');
  
  if (!emailInput || !passwordInput) return;
  
  // Validate inputs
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!email || !password) {
    msg.innerText = "Please fill in all fields";
    msg.className = "msg error";
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    msg.innerText = "Please enter a valid email address";
    msg.className = "msg error";
    return;
  }
  
  msg.innerText = "Logging in...";
  msg.className = "msg";
  
  try{
    const res = await fetch(API + "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if(!res.ok){
      msg.innerText = sanitizeInput(data.msg || "Login failed");
      msg.className = "msg error";
      return;
    }
    
    // Store token securely
    localStorage.setItem("token", data.token);
    msg.innerText = "Login successful! Redirecting...";
    msg.className = "msg success";
    
    // Redirect after short delay
    setTimeout(() => location.href = "dashboard.html", 700);
  } catch(err) {
    console.error('Login error:', err);
    msg.innerText = "Server error. Please try again later.";
    msg.className = "msg error";
  }
}

/* ==========================================
   REGISTER FUNCTION
   ========================================== */
async function registerUser(e){
  e.preventDefault();
  
  const rnameInput = document.getElementById('rname');
  const remailInput = document.getElementById('remail');
  const rpasswordInput = document.getElementById('rpassword');
  const msg = document.getElementById('msg');
  
  if (!rnameInput || !remailInput || !rpasswordInput) return;
  
  // Validate inputs
  const name = rnameInput.value.trim();
  const email = remailInput.value.trim();
  const password = rpasswordInput.value.trim();
  
  if (!name || !email || !password) {
    msg.innerText = "Please fill in all fields";
    msg.className = "msg error";
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    msg.innerText = "Please enter a valid email address";
    msg.className = "msg error";
    return;
  }
  
  // Password strength validation
  if (password.length < 6) {
    msg.innerText = "Password must be at least 6 characters long";
    msg.className = "msg error";
    return;
  }
  
  msg.innerText = "Creating account...";
  msg.className = "msg";
  
  try{
    const res = await fetch(API + "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    
    const data = await res.json();
    
    if(!res.ok){
      msg.innerText = sanitizeInput(data.msg || "Registration failed");
      msg.className = "msg error";
      return;
    }
    
    msg.innerText = sanitizeInput(data.msg || "Registered successfully! Please login.");
    msg.className = "msg success";
    
    // Clear form
    rnameInput.value = '';
    remailInput.value = '';
    rpasswordInput.value = '';
    
    // Switch to login after short delay
    setTimeout(() => switchAuth("login"), 1500);
  } catch(err) {
    console.error('Registration error:', err);
    msg.innerText = "Server error. Please try again later.";
    msg.className = "msg error";
  }
}

/* ==========================================
   INITIALIZE - CHECK IF ALREADY LOGGED IN
   Note: Token validation happens on API calls.
   If token is invalid, API will return 401 and
   user will be redirected to login.
   ========================================== */
(function init() {
  const token = localStorage.getItem("token");
  // Basic check: if token exists and user is on auth page, redirect
  // Actual token validity is verified by API on protected routes
  if (token && window.location.pathname.includes('auth.html')) {
    location.href = "dashboard.html";
  }
})();

