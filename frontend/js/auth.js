const toggleBtn = document.getElementById("toggle-form");
const title = document.getElementById("form-title");
const subtitle = document.getElementById("form-subtitle");
const button = document.querySelector(".auth-btn");
const nameField = document.getElementById("name-field");
const form = document.getElementById("auth-form");
const errorMessage = document.getElementById("error-message");

let isLogin = true;

// API Base URL
const API_BASE = "http://localhost:5000/api";

// Show error message
function showError(message) {
    errorMessage.style.display = "block";
    errorMessage.innerText = message;
    errorMessage.style.color = "#ff6b6b";
    errorMessage.style.marginTop = "10px";
    errorMessage.style.padding = "10px";
    errorMessage.style.backgroundColor = "rgba(255, 107, 107, 0.1)";
    errorMessage.style.borderRadius = "5px";
    errorMessage.style.fontSize = "14px";
}

// Clear error message
function clearError() {
    errorMessage.style.display = "none";
    errorMessage.innerText = "";
}

// Toggle Login / Signup
toggleBtn.onclick = () => {
    isLogin = !isLogin;

    if(isLogin){
        title.innerHTML = "Welcome <span class='text-gradient'>Back</span>";
        subtitle.innerText = "Login to continue";
        button.innerText = "Login";
        toggleBtn.innerText = "Sign up";
        nameField.style.display = "none";
    } else {
        title.innerHTML = "Create <span class='text-gradient'>Account</span>";
        subtitle.innerText = "Start using UX-Ray AI";
        button.innerText = "Sign Up";
        toggleBtn.innerText = "Login";
        nameField.style.display = "block";
    }
};

// Hide name initially
nameField.style.display = "none";

// Handle Form Submit
form.addEventListener("submit", async function(e){
    e.preventDefault();
    clearError();

    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value.trim();
    const name = form.querySelector('input[name="name"]').value.trim();

    // Validation
    if (!email) {
        showError("Please enter your email");
        return;
    }
    if (!password) {
        showError("Please enter your password");
        return;
    }
    if (!isLogin && !name) {
        showError("Please enter your name");
        return;
    }
    if (password.length < 6) {
        showError("Password must be at least 6 characters");
        return;
    }

    button.disabled = true;
    button.innerText = isLogin ? "Logging in..." : "Creating account...";

    try {
        if(isLogin){
            // LOGIN
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if(!response.ok) {
                showError(data.error || "Login failed. Please check your credentials.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            showError("✅ Login Successful! Redirecting...");
            errorMessage.style.color = "#51cf66";
            errorMessage.style.backgroundColor = "rgba(81, 207, 102, 0.1)";
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);

        } else {
            // SIGNUP
            const response = await fetch(`${API_BASE}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if(!response.ok) {
                showError(data.error || "Signup failed. Email might already be in use.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            showError("✅ Signup Successful! Welcome to UX-Ray AI!");
            errorMessage.style.color = "#51cf66";
            errorMessage.style.backgroundColor = "rgba(81, 207, 102, 0.1)";
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);
        }
    } catch (error) {
        showError("Network error: " + error.message);
        console.error("Auth error:", error);
    } finally {
        button.disabled = false;
        button.innerText = isLogin ? "Login" : "Sign Up";
    }
});