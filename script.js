
function togglePassword(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        iconEl.textContent = "🙈";
    } else {
        input.type = "password";
        iconEl.textContent = "👁";
    }
}
function showSignup() {
    document.getElementById("login-form").classList.add("hidden");
    document.getElementById("signup-form").classList.remove("hidden");
    document.getElementById("tab-signin").classList.remove("active");
    document.getElementById("tab-signup").classList.add("active");
}
function showLogin() {
    document.getElementById("signup-form").classList.add("hidden");
    document.getElementById("login-form").classList.remove("hidden");
    document.getElementById("tab-signup").classList.remove("active");
    document.getElementById("tab-signin").classList.add("active");
}
async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const messageBox = document.getElementById("login-message");
    if (!email || !password) {
        messageBox.textContent = "Please enter both email and password.";
        messageBox.style.color = "red";
        return;
    }
    try {
        const response = await fetch(
            "http://10.121.1.171:8080/api/users/login",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, password: password })
            }
        );
        if (response.ok) {
            const data = await response.json();
            messageBox.textContent = "Login successful! Redirecting...";
            messageBox.style.color = "green";
            localStorage.setItem("userId", data.id);
            localStorage.setItem("userName", data.name);
            localStorage.setItem("userEmail", data.email);
            localStorage.setItem("userRole", data.role);
            setTimeout(function() {
                window.location.href = "courses.html";
            }, 1000);
        } else {
            const errorText = await response.text();
            messageBox.textContent = errorText;
            messageBox.style.color = "red";
        }
    } catch (error) {
        messageBox.textContent = "Could not reach the server. Is the backend running and on the same network?";
        messageBox.style.color = "red";
    }
}
async function signup() {
    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const messageBox = document.getElementById("signup-message");
    if (!name || !email || !password) {
        messageBox.textContent = "Please fill in all fields.";
        messageBox.style.color = "red";
        return;
    }
    try {
        const response = await fetch(
            "http://10.121.1.171:8080/api/users/signup",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name, email: email, password: password })
            }
        );
        if (response.ok) {
            const data = await response.json();
            messageBox.textContent = "Signup successful! You can now log in.";
            messageBox.style.color = "green";
            localStorage.setItem("userId", data.id);
            localStorage.setItem("userName", data.name);
            localStorage.setItem("userEmail", data.email);
            localStorage.setItem("userRole", data.role);
        } else {
            const errorText = await response.text();
            messageBox.textContent = errorText;
            messageBox.style.color = "red";
        }
    } catch (error) {
        messageBox.textContent = "Could not reach the server. Is the backend running and on the same network?";
        messageBox.style.color = "red";
    }
}