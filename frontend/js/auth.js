const toggleBtn = document.getElementById("toggle-form");
const title = document.getElementById("form-title");
const subtitle = document.getElementById("form-subtitle");
const button = document.querySelector(".auth-btn");
const nameField = document.getElementById("name-field");
const form = document.getElementById("auth-form");
const errorMessage = document.getElementById("error-message");

let isLogin = true;

// API Base URL
const API_BASE = "/api";

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

// Google Sign-in Implementation
document.addEventListener("DOMContentLoaded", function () {
    console.log("Auth page loaded, initializing Google GSI...");
    
    const CLIENT_ID = "1006625829906-k8996r9mmhkm1mkjttaj28l7tu51fl5r.apps.googleusercontent.com";

    // Small delay to ensure everything is rendered
    setTimeout(() => {
        if (typeof google !== 'undefined') {
            console.log("Google SDK detected.");
            google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleGoogleResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            const btnContainer = document.getElementById("google-official-btn");
            const referenceBtn = document.getElementById("google-login");

            if (btnContainer && referenceBtn) {
                console.log("Rendering official button overlay...");
                google.accounts.id.renderButton(
                    btnContainer,
                    { 
                        theme: "outline", 
                        size: "large", 
                        width: referenceBtn.offsetWidth || 400,
                        text: "continue_with"
                    }
                );

                // Fallback: If for some reason the overlay isn't clickable, 
                // clicking the custom button will try to trigger the prompt
                referenceBtn.onclick = () => {
                    console.log("Custom button clicked, triggering prompt fallback...");
                    google.accounts.id.prompt();
                };
            }
        } else {
            console.warn("Google SDK not detected.");
        }
    }, 1500);
});

async function handleGoogleResponse(response) {
    console.log("Google response received, verifying...");
    clearError();
    const idToken = response.credential;

    try {
        const res = await fetch(`${API_BASE}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken })
        });

        const data = await res.json();

        if (!res.ok) {
            showError(data.error || "Google Login failed");
            return;
        }

        // Save session
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showError("✅ Google Login Successful! Redirecting...");
        errorMessage.style.color = "#51cf66";
        errorMessage.style.backgroundColor = "rgba(81, 207, 102, 0.1)";
        
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);

    } catch (error) {
        showError("Google Auth Network Error");
        console.error("Google Auth Error:", error);
    }
}