---
title: "QuizMaster — Professional Online Quiz Platform"
subtitle: "Project Report"
author: "Maviya Attar"
date: "2026-03-23"
institute: "Maulana Azad Polytechnic, Solapur · CO4K"
---

# QuizMaster — Professional Online Quiz Platform

---

## Cover Page

|                     |                                                       |
|---------------------|-------------------------------------------------------|
| **Project Title**   | QuizMaster — Professional Online Quiz Platform        |
| **Author**          | Maviya Attar                                          |
| **Institute**       | Maulana Azad Polytechnic, Solapur                     |
| **Class / Branch**  | CO4K (Computer Engineering, 4th Year)                 |
| **Date**            | 2026-03-23                                            |
| **Live Demo**       | <https://quiz-master-six-olive.vercel.app>            |
| **Repository**      | <https://github.com/maviyaattar/Quiz-Master>          |

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Objectives](#2-objectives)
3. [Key Features](#3-key-features)
4. [Screenshots](#4-screenshots)
5. [Tech Stack](#5-tech-stack)
6. [System Architecture](#6-system-architecture)
7. [Module / Page Descriptions](#7-module--page-descriptions)
8. [Security](#8-security)
9. [Accessibility](#9-accessibility)
10. [Testing Checklist](#10-testing-checklist)
11. [Future Scope](#11-future-scope)
12. [Conclusion](#12-conclusion)
13. [References](#13-references)

---

## 1. Abstract

QuizMaster is a full-featured, browser-based online quiz platform designed for academic institutions and corporate training environments. It empowers educators and administrators to **create, manage, and monitor live quizzes** while giving students a seamless, distraction-free quiz-taking experience. The platform is built entirely with standard web technologies (HTML5, CSS3, and ES6+ JavaScript) on the frontend and communicates with a dedicated RESTful API backend hosted on Render. Key differentiators include AI-powered question generation (via Groq/Mixtral), real-time anti-cheat protection, Progressive Web App (PWA) support, and strict accessibility compliance with WCAG 2.1 Level AA guidelines.

This report documents the system design, feature set, technical architecture, security measures, and future roadmap of the QuizMaster project as developed by **Maviya Attar** at **Maulana Azad Polytechnic, Solapur (CO4K)**.

---

## 2. Objectives

The primary objectives of the QuizMaster project are:

1. **Eliminate paper-based assessments** by providing a reliable digital alternative suitable for classrooms and online learning environments.
2. **Accelerate quiz creation** through an intuitive UI and optional AI-powered question generation.
3. **Ensure assessment integrity** with real-time anti-cheat measures (tab-switch detection, auto-submit on time expiry).
4. **Deliver a responsive, accessible experience** across desktops, tablets, and mobile devices.
5. **Support easy deployment** as a Progressive Web App (PWA) installable directly from the browser.
6. **Provide actionable analytics** so educators can evaluate student performance via leaderboards and score breakdowns.
7. **Follow modern web security practices** to protect student data and prevent common web vulnerabilities.

---

## 3. Key Features

### 3.1 For Quiz Creators

| Feature | Description |
|---|---|
| **Easy Quiz Creation** | Intuitive form-based interface to build multiple-choice quizzes with any number of questions |
| **AI-Powered Generation** | Automatically generates questions from a topic/prompt using the Groq AI (Mixtral model) via the backend API |
| **Question Management** | Add, edit, delete, and reorder questions; set correct answers and option labels |
| **Negative Marking** | Optional per-question penalty for wrong answers to discourage guessing |
| **Shareable Quiz Codes** | Auto-generated unique alphanumeric codes for students to join quizzes instantly |
| **Live Quiz Control** | Start, monitor, pause, and end quizzes in real time from the dashboard |
| **Analytics Dashboard** | View participant list, individual scores, and overall performance metrics |
| **Logo & Branding** | Upload organization logo and set quiz branding name |

### 3.2 For Quiz Takers

| Feature | Description |
|---|---|
| **Quick Join** | Enter a quiz code on the Join page — no account required for students |
| **Timer-Based Tests** | Countdown timer prominently displayed; auto-submits on expiry |
| **Anti-Cheat Protection** | Detects tab switching / window focus loss; issues warnings and records violations |
| **Instant Submission** | One-click manual submission or automatic on timer end |
| **Results & Review** | Detailed score card with correct/incorrect breakdown after submission |
| **Mobile Responsive** | Optimized layout for phones, tablets, and desktops |

### 3.3 Technical Excellence

| Feature | Description |
|---|---|
| **PWA Ready** | `manifest.json` enables "Add to Home Screen" installation on Android/iOS |
| **Modern UI/UX** | Gradient color scheme, smooth CSS animations, and card-based layouts |
| **SEO Optimized** | Open Graph and meta tags for social sharing and search engine indexing |
| **Accessibility** | ARIA labels, keyboard navigation, focus indicators, and reduced-motion support |
| **Security First** | XSS sanitization, JWT token management, and strict input validation |

---

## 4. Screenshots

### 4.1 Landing Page

The landing page presents a clean, modern design with a gradient hero section, feature highlights, and clear call-to-action buttons for creating and joining quizzes.

![Landing Page — QuizMaster](https://github.com/user-attachments/assets/537d4e38-2d71-461f-81f0-d2bf59d29555)

*Figure 1: QuizMaster Landing Page (`index.html`) — Hero section with navigation and CTA buttons.*

---

### 4.2 Authentication Page

Secure login and registration UI with real-time input validation, password strength feedback, and toggle between Login / Register modes.

![Authentication Page — QuizMaster](https://github.com/user-attachments/assets/89306c10-5f32-4716-87ee-5840f1b8be54)

*Figure 2: Authentication Page (`auth.html`) — Login form with validation.*

---

### 4.3 Join Quiz Page

Students enter their quiz code, name, roll number, and branch to join a quiz. The interface remains simple and distraction-free to keep students focused.

![Join Quiz Page — QuizMaster](https://github.com/user-attachments/assets/a1463e21-f857-4b5c-8854-f0ecf563e91d)

*Figure 3: Join Quiz Page (`join.html`) — Student entry form.*

---

## 5. Tech Stack

### 5.1 Frontend

| Technology | Version / Notes | Purpose |
|---|---|---|
| **HTML5** | Semantic elements | Page structure and document outline |
| **CSS3** | Custom CSS with variables | Styling, animations, responsive layout |
| **JavaScript** | ES6+ (Vanilla JS) | Application logic, API calls, DOM manipulation |
| **Google Fonts** | Poppins | Primary typeface across all pages |
| **Font Awesome** | 6.5.0 (CDN) | Icons throughout the UI |

### 5.2 Backend (External Service)

| Technology | Notes |
|---|---|
| **Node.js / Express** | RESTful API server (separate repository) |
| **Render Platform** | Hosting for the backend API (`https://portfolio-backend-api-8me4.onrender.com`) |
| **JWT Authentication** | Tokens issued by backend, stored in `localStorage` |
| **Groq AI (Mixtral)** | AI question generation, called server-side via backend |

### 5.3 Deployment & Tooling

| Tool | Purpose |
|---|---|
| **Vercel** | Static frontend hosting with auto-deploy from GitHub |
| **GitHub Actions** | CI/CD pipeline for PDF report generation |
| **PWA Manifest** | `manifest.json` enabling native-like app installation |
| **Pandoc + wkhtmltopdf** | Markdown → PDF conversion in CI pipeline |

---

## 6. System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                            │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │index.html│  │auth.html │  │dashboard │  │  create.html │  │
│  │          │  │          │  │  .html   │  │              │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │join.html │  │attempt   │  │results   │  │  profile.html│  │
│  │          │  │  .html   │  │  .html   │  │              │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
│                                                                │
│  ┌─────────────┐   ┌─────────────┐   ┌────────────────────┐  │
│  │   css/      │   │    js/      │   │  manifest.json     │  │
│  │  (styles)   │   │  (scripts)  │   │  (PWA config)      │  │
│  └─────────────┘   └─────────────┘   └────────────────────┘  │
│                           │                                    │
│                    Fetch / AJAX                                 │
│                     (REST API)                                  │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js / Express)                   │
│            Hosted on Render Platform                           │
│                                                                │
│  /api/auth/login       /api/auth/register                      │
│  /api/quiz/my          /api/quiz/create                        │
│  /api/quiz/join        /api/quiz/start                         │
│  /api/quiz/submit      /api/quiz/results                       │
│  /api/quiz/generate-ai (→ Groq AI / Mixtral)                   │
└────────────────────────────────────────────────────────────────┘
```

### 6.1 Data Flow

1. **Authentication**: User submits credentials → `POST /api/auth/login` → JWT token returned → stored in `localStorage`.
2. **Quiz Creation**: Creator fills form on `create.html` → JS validates and serializes questions → `POST /api/quiz/create` with JWT header.
3. **Student Join**: Student enters code on `join.html` → `POST /api/quiz/join` → student session created → redirected to `attempt.html`.
4. **Quiz Attempt**: `attempt.html` polls backend for quiz state → renders questions with countdown timer → on submit, `POST /api/quiz/submit`.
5. **Results**: `results.html` fetches scores → renders leaderboard and individual breakdown.

---

## 7. Module / Page Descriptions

### 7.1 `index.html` — Landing Page

The public-facing landing page serves as the entry point for all users. It contains:
- A gradient hero section with product name, tagline, and CTA buttons ("Create Quiz" / "Join Quiz").
- A features grid highlighting key capabilities (AI generation, anti-cheat, PWA, accessibility).
- A responsive navigation bar with links to Auth and Join pages.
- **Script**: `js/script.js` checks for an existing JWT token and redirects authenticated users to the dashboard automatically.
- **Style**: `css/style.css` — primary stylesheet with CSS custom properties for theming.

### 7.2 `auth.html` — Authentication

Handles both **Login** and **Register** flows in a single page via tab switching:
- Real-time client-side validation (email regex, password length ≥ 6).
- On successful login: JWT token saved to `localStorage`, user redirected to `dashboard.html`.
- On successful registration: auto-login and redirect.
- **Script**: `js/script.js`
- **APIs used**: `POST /api/auth/login`, `POST /api/auth/register`

### 7.3 `dashboard.html` — Quiz Creator Dashboard

The main hub for authenticated quiz creators:
- Lists all quizzes created by the logged-in user with status badges (Active / Ended / Pending).
- "Create Test" button navigates to `create.html`.
- Quiz cards show title, question count, participant count, and action buttons (Start / View / Delete).
- Fetches quiz list on page load from `GET /api/quiz/my`.
- **Script**: `js/dashboard.js`
- **Style**: `css/dashboard.css`

### 7.4 `create.html` — Quiz Creation

Two-mode quiz builder:
- **Manual Mode**: Add questions one by one with a form (question text, 4 options, correct answer, optional negative mark).
- **AI Mode**: Enter topic, difficulty, and question count → backend calls Groq AI → questions populated automatically.
- Live question list preview with edit/delete controls.
- Final submission packages all questions and metadata into `POST /api/quiz/create`.
- **Script**: `js/create.js`
- **Style**: `css/create.css`

### 7.5 `join.html` — Join Quiz

Student-facing entry form:
- Fields: Quiz Code, Full Name, Roll Number, Branch.
- Validates code existence via backend before allowing entry.
- On success, stores student session and redirects to `attempt.html`.
- No account required — accessible without authentication.
- **Script**: `js/join.js`
- **Style**: `css/join.css`

### 7.6 `attempt.html` — Quiz Attempt

The core test-taking interface:
- Displays questions one at a time (or all at once, depending on quiz config).
- Prominent countdown timer with color changes as time decreases (green → yellow → red → blinking).
- **Anti-cheat**: `visibilitychange` and `blur` events trigger a warning toast; repeated violations are logged.
- Keyboard navigation support (Tab/Enter for option selection).
- Auto-submits when timer reaches zero via `POST /api/quiz/submit`.
- **Script**: `js/attempt.js`
- **Style**: `css/attempt.css`

### 7.7 `test.html` — Quiz Management / Monitor

Used by quiz creators to manage a live or completed quiz:
- Shows real-time participant list and submission status.
- "Start Quiz" and "End Quiz" controls.
- Live leaderboard updating as students submit.
- **Script**: `js/test.js`
- **Style**: `css/test.css`

### 7.8 `results.html` — Results & Leaderboard

Post-quiz results page:
- Displays final leaderboard sorted by score (highest first).
- Individual answer breakdown (correct/incorrect per question).
- Score statistics: average, highest, lowest.
- **Script**: `js/results.js`
- **Style**: `css/results.css`

### 7.9 `profile.html` — User Profile

Account management for quiz creators:
- View and update display name and email.
- Change password with current-password verification.
- Quiz history with quick links.
- **Script**: `js/profile.js`
- **Style**: `css/profile.css`

### 7.10 `explanation.html` — Technical Documentation

An in-app technical reference page documenting:
- System architecture diagrams (ASCII/HTML).
- All REST API endpoints with request/response formats.
- Frontend module descriptions.
- Security and accessibility notes.
- Not linked from the main navigation — intended for developers.

---

## 8. Security

QuizMaster applies multiple layers of security across the frontend and API interaction:

| Measure | Implementation |
|---|---|
| **Input Sanitization** | All user-supplied strings are HTML-escaped before rendering in the DOM to prevent Cross-Site Scripting (XSS) |
| **Email Validation** | Dual validation: HTML5 `type="email"` attribute + regex pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| **Password Policy** | Minimum 6 characters enforced client-side and server-side |
| **JWT Token Storage** | Access tokens stored in `localStorage`; included as `Authorization: Bearer <token>` headers on all authenticated API calls |
| **API Error Handling** | All `fetch()` calls wrap responses in try/catch; HTTP 401 responses trigger automatic logout and redirect to `auth.html` |
| **Anti-Cheat Logging** | Tab-switch and window-blur events are timestamped and reported to the backend for review by the quiz creator |
| **No Sensitive Data in Frontend** | API keys and secrets are managed entirely by the backend; no credentials are present in any frontend JS file |
| **Content Security** | All external resources (Google Fonts, Font Awesome) loaded over HTTPS; no mixed-content issues |

---

## 9. Accessibility

QuizMaster is designed to comply with **WCAG 2.1 Level AA** guidelines:

| Criterion | Implementation |
|---|---|
| **Keyboard Navigation** | All interactive elements (buttons, inputs, links) are reachable via Tab; quiz options can be selected with Enter/Space |
| **Screen Reader Support** | ARIA `role`, `aria-label`, `aria-live`, and `aria-describedby` attributes on dynamic components; timer announces remaining time |
| **Focus Indicators** | Custom `:focus-visible` styles ensure visible focus rings on all focusable elements |
| **Color Contrast** | Primary text (#1f2937) on white background achieves a contrast ratio > 7:1 (AAA level) |
| **Reduced Motion** | `@media (prefers-reduced-motion: reduce)` suppresses all CSS animations and transitions for affected users |
| **Semantic HTML** | `<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`, `<article>` elements provide document structure |
| **Form Labels** | Every `<input>` has an associated `<label>` or `aria-label`; error messages are programmatically associated |
| **Responsive Text** | Font sizes use relative units (`rem`/`em`) to respect browser font-size settings |

---

## 10. Testing Checklist

The following manual test scenarios have been verified against the live deployment:

### Authentication
- [x] User registration with valid credentials succeeds
- [x] Duplicate email registration is rejected with a clear error
- [x] Login with correct credentials redirects to dashboard
- [x] Login with incorrect password shows error message
- [x] JWT token is stored and used for subsequent requests
- [x] Logged-out users are redirected to `auth.html` from protected pages

### Quiz Creation
- [x] Manual question creation with 4 options and correct answer
- [x] AI question generation from a topic prompt returns structured questions
- [x] Edit and delete individual questions works correctly
- [x] Negative marking toggle is saved with the quiz
- [x] Quiz code is generated and displayed after creation
- [x] Validation prevents submission with empty questions or missing correct answer

### Quiz Attempt (Student Flow)
- [x] Student joins with valid quiz code and personal details
- [x] Countdown timer decrements correctly each second
- [x] Timer color changes at threshold levels (warning / danger)
- [x] Tab-switch triggers anti-cheat warning toast
- [x] Repeated tab-switches are counted and logged
- [x] Timer expiry triggers automatic submission
- [x] Manual submit button works before timer ends

### Results & Leaderboard
- [x] Scores are displayed correctly after submission
- [x] Leaderboard ranks participants by score
- [x] Individual question breakdown shows correct/incorrect

### Responsive Design
- [x] Layout adapts correctly on mobile (< 480px)
- [x] Layout adapts correctly on tablet (480px–768px)
- [x] Layout adapts correctly on desktop (> 768px)

### Accessibility
- [x] All interactive elements reachable by keyboard Tab
- [x] Screen reader announces quiz timer updates
- [x] Focus indicators visible on all buttons and inputs
- [x] No WCAG AA color-contrast violations detected

### PWA
- [x] `manifest.json` loads without errors
- [x] "Add to Home Screen" prompt appears on supported browsers
- [x] App icon (favicon.svg) renders correctly

---

## 11. Future Scope

The following enhancements are planned or recommended for future development cycles:

| Priority | Enhancement | Description |
|---|---|---|
| **High** | **Real-time WebSocket updates** | Replace polling with WebSocket connections for instant leaderboard updates and quiz-state sync |
| **High** | **Offline Support (Service Worker)** | Add a service worker to cache assets and enable offline quiz-taking for pre-loaded quizzes |
| **High** | **Multi-language Support (i18n)** | Internationalize the UI for regional languages (Marathi, Hindi, Urdu) to serve rural students |
| **Medium** | **Question Bank** | Allow creators to save questions to a reusable bank and import them into new quizzes |
| **Medium** | **Rich Text / Media Questions** | Support images, mathematical equations (LaTeX/MathJax), and code snippets in questions |
| **Medium** | **Bulk Import via CSV/Excel** | Let creators upload question sets from spreadsheets |
| **Medium** | **Advanced Analytics** | Per-question difficulty analytics, time-spent charts, and exportable reports (PDF/Excel) |
| **Low** | **Dark Mode** | System-preference-based dark theme with manual toggle |
| **Low** | **Certificate Generation** | Auto-generate downloadable completion certificates for quiz takers |
| **Low** | **OAuth Login** | Google / GitHub OAuth for frictionless student authentication |

---

## 12. Conclusion

QuizMaster successfully delivers a comprehensive, production-ready online quiz platform built entirely on modern web standards. The project demonstrates how a static frontend — with no build tools or frameworks — can interface with a cloud-hosted backend API to produce a feature-rich, secure, and accessible application.

Key accomplishments:
- **Complete feature parity** with commercial quiz platforms (live control, AI generation, anti-cheat, leaderboard).
- **WCAG 2.1 Level AA accessibility** compliance ensuring inclusivity for all users.
- **Zero external JS framework dependencies** on the frontend, keeping the codebase lightweight and maintainable.
- **PWA support** enabling native-like installation on any device.
- **Automated PDF documentation** via GitHub Actions, ensuring the project report stays up to date.

QuizMaster demonstrates that thoughtfully engineered web technologies, combined with a clean API architecture, can produce software that is both technically sound and genuinely useful in academic settings. The codebase is open-source, well-documented, and ready for community contributions.

---

## 13. References

1. **QuizMaster Repository** — <https://github.com/maviyaattar/Quiz-Master>
2. **Live Demo** — <https://quiz-master-six-olive.vercel.app>
3. **MDN Web Docs: HTML5** — <https://developer.mozilla.org/en-US/docs/Web/HTML>
4. **MDN Web Docs: CSS3** — <https://developer.mozilla.org/en-US/docs/Web/CSS>
5. **MDN Web Docs: Fetch API** — <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API>
6. **Font Awesome 6.5.0** — <https://fontawesome.com>
7. **Google Fonts — Poppins** — <https://fonts.google.com/specimen/Poppins>
8. **WCAG 2.1 Guidelines** — <https://www.w3.org/TR/WCAG21/>
9. **Web App Manifest (MDN)** — <https://developer.mozilla.org/en-US/docs/Web/Manifest>
10. **Groq AI — Mixtral Model** — <https://groq.com>
11. **Render Cloud Platform** — <https://render.com>
12. **Vercel Deployment** — <https://vercel.com>
13. **Pandoc Document Converter** — <https://pandoc.org>
14. **GitHub Actions Documentation** — <https://docs.github.com/en/actions>

---

*Report generated for academic submission — Maulana Azad Polytechnic, Solapur, CO4K, 2026.*
