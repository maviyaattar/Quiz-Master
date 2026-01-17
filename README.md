# QuizMaster - Professional Online Quiz Platform

<div align="center">

![QuizMaster Banner](https://github.com/user-attachments/assets/537d4e38-2d71-461f-81f0-d2bf59d29555)

**Create, manage, and take professional online quizzes**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation)

</div>

---

## 🌟 Features

### For Quiz Creators
- 📝 **Easy Quiz Creation** - Intuitive interface for creating multiple-choice quizzes
- 🎯 **Question Management** - Add, edit, and delete questions with ease
- 🔴 **Live Quiz Control** - Start, monitor, and end quizzes in real-time
- 📊 **Analytics Dashboard** - View participant scores and performance metrics
- 🔗 **Shareable Quiz Codes** - Generate unique codes for quiz access

### For Quiz Takers
- 🚀 **Quick Join** - Join quizzes instantly with a quiz code
- ⏱️ **Timer-Based Tests** - Timed quizzes with countdown display
- 🔒 **Anti-Cheat Protection** - Tab switching detection and warnings
- ✅ **Instant Submission** - Automatic submission on time expiry
- 📱 **Mobile Responsive** - Take quizzes on any device

### Technical Excellence
- 🎨 **Modern UI/UX** - Gradient designs, smooth animations, and professional styling
- 🔐 **Security First** - Input sanitization, XSS prevention, and secure authentication
- ♿ **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- 📱 **PWA Ready** - Installable as a web app with manifest support
- 🌐 **SEO Optimized** - Meta tags for search engines and social sharing

---

## 🖼️ Screenshots

### Landing Page
Clean, modern design with clear call-to-action buttons.

![Landing Page](https://github.com/user-attachments/assets/537d4e38-2d71-461f-81f0-d2bf59d29555)

### Authentication
Secure login and registration with input validation.

![Auth Page](https://github.com/user-attachments/assets/89306c10-5f32-4716-87ee-5840f1b8be54)

### Join Quiz
Simple interface for students to join quizzes.

![Join Page](https://github.com/user-attachments/assets/a1463e21-f857-4b5c-8854-f0ecf563e91d)

---

## 🚀 Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (Apache, Nginx, or Python's HTTP server)
- Backend API (see [Backend Setup](#backend-setup))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/maviyaattar/Quiz-Master.git
   cd Quiz-Master
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser**
   ```
   http://localhost:8080
   ```

---

## 📚 Usage

### For Quiz Creators

1. **Register/Login** - Create an account or login at `/auth.html`
2. **Create Quiz** - Navigate to dashboard and click "Create Test"
3. **Add Questions** - Add multiple-choice questions with options
4. **Start Quiz** - Generate a unique quiz code and start the quiz
5. **Monitor** - Track participants and view real-time leaderboard
6. **View Results** - Check scores and performance metrics

### For Quiz Takers

1. **Join Quiz** - Visit `/join.html` and enter the quiz code
2. **Enter Details** - Provide name, roll number, and branch
3. **Wait for Start** - Quiz creator will start the quiz
4. **Attempt Quiz** - Answer questions within the time limit
5. **Submit** - Submit manually or auto-submit on time expiry

---

## 🏗️ Architecture

### File Structure

```
Quiz-Master/
├── index.html              # Landing page
├── auth.html               # Login/Register
├── dashboard.html          # Quiz creator dashboard
├── create.html             # Quiz creation page
├── profile.html            # User profile
├── join.html               # Quiz joining page
├── attempt.html            # Quiz attempt page
├── test.html               # Quiz details/management
├── css/
│   ├── style.css          # Main styles
│   ├── dashboard.css      # Dashboard styles
│   ├── create.css         # Create quiz styles
│   ├── profile.css        # Profile styles
│   ├── join.css           # Join quiz styles
│   ├── attempt.css        # Attempt quiz styles
│   └── test.css           # Test management styles
├── js/
│   ├── script.js          # Authentication logic
│   ├── dashboard.js       # Dashboard functionality
│   ├── create.js          # Quiz creation logic
│   ├── profile.js         # Profile management
│   ├── join.js            # Join quiz logic
│   ├── attempt.js         # Quiz attempt logic
│   └── test.js            # Test management
├── favicon.svg            # Site favicon
├── manifest.json          # PWA manifest
└── README.md              # This file
```

### Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: Google Fonts (Poppins)
- **Icons**: Font Awesome 6.5.0
- **Backend API**: Node.js/Express (separate repository)

---

## 🔐 Security Features

- **Input Sanitization** - All user inputs are sanitized to prevent XSS attacks
- **Email Validation** - Regex-based email validation with HTML5 support
- **Password Requirements** - Minimum 6 characters enforced
- **Secure Token Storage** - JWT tokens stored in localStorage
- **API Error Handling** - Graceful handling of all API errors
- **Anti-Cheat Measures** - Tab switching detection with warning system

---

## ♿ Accessibility

QuizMaster follows WCAG 2.1 Level AA guidelines:

- ✅ **Keyboard Navigation** - Full keyboard support for all interactive elements
- ✅ **Screen Readers** - ARIA labels and roles for assistive technologies
- ✅ **Focus Indicators** - Visible focus states for all focusable elements
- ✅ **Color Contrast** - Meets WCAG contrast requirements
- ✅ **Reduced Motion** - Respects user's motion preferences
- ✅ **Semantic HTML** - Proper HTML5 semantic elements

---

## 📱 Responsive Design

QuizMaster is fully responsive across all devices:

- 📱 **Mobile** (< 480px) - Optimized for phones
- 📱 **Tablet** (480px - 768px) - Touch-friendly interface
- 💻 **Laptop** (768px - 1200px) - Standard desktop experience
- 🖥️ **Desktop** (> 1200px) - Full-featured layout

---

## 🎨 Customization

### Color Scheme

The application uses CSS custom properties for easy theming:

```css
:root {
  --primary: #5b6cff;
  --secondary: #8f5bff;
  --bg: #f6f7fb;
  --card: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
  --radius: 18px;
}
```

### Animations

All animations can be customized in the respective CSS files:

- Fade effects (fadeIn, fadeUp, fadeDown)
- Slide effects (slideIn, slideDown)
- Scale effects (scaleIn)
- Pulse effects (for timers)
- Spin effects (for loaders)

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Quiz creation with multiple questions
- [ ] Quiz code generation and sharing
- [ ] Student joining with quiz code
- [ ] Quiz attempt with timer
- [ ] Anti-cheat warnings on tab switch
- [ ] Auto-submit on time expiry
- [ ] Leaderboard and results display
- [ ] Responsive design on mobile
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Maviya Attar**

- GitHub: [@maviyaattar](https://github.com/maviyaattar)

---

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for Poppins font
- All contributors and testers

---

## 📞 Support

For support, email support@quizmaster.com or open an issue on GitHub.

---

<div align="center">

Made with ❤️ by **Maviya Attar**

⭐ Star this repository if you find it helpful!

</div>