# UX-Ray AI 🚀
### AI-Powered Website UX & Performance Analyzer

**UX-Ray AI** is a professional SaaS platform designed to help web developers and business owners audit their website's User Experience (UX) and performance. Using Google Cloud APIs and AI-driven insights, it provides actionable scores, gamified rewards, and a comprehensive dashboard.

---

## ✨ Key Features

*   **🔍 Real-Time UX Analysis:** Enter any URL to get an instant breakdown of Performance, Accessibility, SEO, and Best Practices.
*   **🤖 AI Insights:** Integration with OpenAI to provide human-like recommendations for improving conversion rates.
*   **🔐 Secure Authentication:** Multi-method login system featuring Email/Password and **Google One-Tap Sign-In**.
*   **🎮 Gamification & Rewards:** Earn "UX-Tokens" for every analysis performed. Level up your profile and track your progress.
*   **📊 Dynamic Dashboard:** Visualized analytics using Chart.js to track score history and token earnings.
*   **🏆 Leaderboard:** Compete with other users to see who has the most analyzed websites and tokens.
*   **💳 E-Commerce & Stripe:** A built-in shop to purchase premium UX reports and services using Stripe payment integration.

---

## 🛠️ Tech Stack

**Frontend:**
- **Core:** HTML5, CSS3 (Modern Glassmorphism Design), Vanilla JavaScript
- **Visuals:** Chart.js, FontAwesome, Google Fonts (Poppins)
- **Auth:** Google Identity Services (GSI) SDK

**Backend:**
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Security:** JWT (JSON Web Tokens), Bcrypt.js, CORS
- **APIs:** Google PageSpeed Insights, OpenAI API, Stripe API

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Google Cloud Console Project (for API keys)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Gittykrsh/UXRAY-AI.git

# Navigate to project
cd UXRAY-AI

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add:
```env
MONGODB_URI=mongodb://localhost:27017/uxrayai
JWT_SECRET=your_super_secret_key
GOOGLE_API_KEY=your_google_pagespeed_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PORT=5000
```

### 4. Running the App
```bash
# Run backend and frontend (Express serves the static files)
npm start
```
The app will be available at `http://localhost:5000`

---

## 📸 Screenshot

<img width="1892" height="1022" alt="image" src="https://github.com/user-attachments/assets/216395fd-a305-472d-bd62-15c6dfc25bef" />


---

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License
This project is licensed under the MIT License.
