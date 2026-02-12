/* ============================================
   CONFIG.EXAMPLE.JS - Configuration Template
   Maviya Attar - Quiz Master Platform
   ============================================ */

/**
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to 'config.js' in the same directory
 * 2. Replace 'YOUR_GROQ_API_KEY_HERE' with your actual Groq API key
 * 3. Never commit config.js to the repository
 * 
 * To get a Groq API key:
 * - Visit https://console.groq.com/
 * - Sign up or log in
 * - Navigate to API Keys section
 * - Create a new API key
 */

const CONFIG = {
  // Groq AI API Configuration
  GROQ_API_KEY: 'YOUR_GROQ_API_KEY_HERE',
  GROQ_URL: 'https://api.groq.com/openai/v1/chat/completions',
  
  // Model Configuration
  GROQ_MODEL: 'mixtral-8x7b-32768',
  GROQ_TEMPERATURE: 0.7,
  GROQ_MAX_TOKENS: 4000
};

// Make config available globally
window.CONFIG = CONFIG;
