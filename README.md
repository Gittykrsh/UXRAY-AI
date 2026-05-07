# <p align="center">✨ UX-Ray AI – The Future of Website Analysis ✨</p>

<p align="center">
  
  <img width="1892" height="1022" alt="Screenshot 2026-05-06 225617" src="https://github.com/user-attachments/assets/30932ed5-5f45-4409-9a3c-73ab414b2404" />

</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white" alt="Railway">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

---

## 📖 Overview

**UX-Ray AI** is a cutting-edge SaaS platform designed to transform how developers and business owners view their websites. By combining the power of **Google PageSpeed Insights** and **OpenAI**, UX-Ray AI provides a deep-dive analysis into Performance, Accessibility, SEO, and User Experience, all wrapped in a beautifully gamified dashboard.

---

## 🔥 Key Features

| Feature | Description |
| :--- | :--- |
| **🔍 AI UX Audit** | Real-time analysis with custom scores and AI-powered improvement tips. |
| **🔐 Secure Auth** | Email/Password & **Google One-Tap** integration for a seamless experience. |
| **🎮 Gamification** | Earn **UX-Tokens** for every analysis. Level up and climb the leaderboard. |
| **📊 Smart Dashboard** | Interactive charts (Chart.js) to track your website's health over time. |
| **🛍️ Token Store** | Integrated shop to purchase premium reports and SEO services using tokens. |
| **💳 Stripe Payments** | Secure checkout for premium packages and token top-ups. |

---

## 🛠️ Tech Stack

### **Frontend (The Beauty)**
*   **Aesthetics:** Modern Glassmorphism UI with Vanilla CSS.
*   **Logic:** Asynchronous JavaScript (ES6+).
*   **Visuals:** Chart.js for data visualization.
*   **Icons:** FontAwesome & Lucide Icons.

### **Backend (The Brain)**
*   **Server:** Node.js & Express.js (Modular MVC Pattern).
*   **Database:** MongoDB Atlas with Mongoose.
*   **Security:** JWT, Bcrypt, and Google OAuth 2.0.
*   **APIs:** Google Identity Services, OpenAI, Stripe, Razorpay.

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/Gittykrsh/UXRAY-AI.git
cd UXRAY-AI
npm install
```

### 2. Configuration
Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_atlas_url
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_id.apps.googleusercontent.com
OPENAI_API_KEY=sk-xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
PORT=5000
```

### 3. Run Locally
```bash
npm start
```
Access the app at `http://localhost:5000`

---

## 🌍 Deployment

### **Option 1: Railway (Recommended 🚀)**
Railway is the best choice for this project as it handles both frontend and backend in one go without cold starts or timeouts.
1.  Connect your GitHub repo to **[Railway.app](https://railway.app/)**.
2.  Add your `.env` variables in the **Variables** tab.
3.  Railway will automatically detect the root `package.json` and start the server.

### **Option 2: Vercel**
Optimized for serverless deployment.
1.  Connect your GitHub repo to **Vercel**.
2.  Add your `.env` variables in the dashboard.
3.  Vercel will use the `vercel.json` configuration for routing.

---

## 📸 Screenshots
<p align="center">
  <img width="1892" height="1022" alt="UX-Ray AI Screenshot" src="https://github.com/user-attachments/assets/30932ed5-5f45-4409-9a3c-73ab414b2404" />
</p>


Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  Developed with ❤️ by <a href="https://github.com/Gittykrsh">Gittykrsh</a>
</p>
