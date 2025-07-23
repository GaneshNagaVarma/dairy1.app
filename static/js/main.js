// auth.js - Client-side Authentication Functionality

document.addEventListener("DOMContentLoaded", () => {
    checkAuthStatus();
    updateNavbar();
});

/**
 * Checks if user is logged in and redirect if on login page.
 */
function checkAuthStatus() {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser && window.location.pathname === "/login") {
        window.location.href = "/shopping"; // Redirect if logged in
    }
}

/**
 * Show login form
 */
function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
}

/**
 * Show register form
 */
function showRegisterForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
}

/**
 * Handle login
 */
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            showNotification("Login successful! Redirecting...", "success");
            setTimeout(() => window.location.href = "/", 1500); // ✅ Redirect to Home
        } else {
            showNotification(data.error || "Login failed.", "error");
        }
    } catch (error) {
        console.error(error);
        showNotification("Login failed. Try again.", "error");
    }
}

/**
 * Handle registration
 */
async function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const phone = document.getElementById("registerPhone").value;
    const address = document.getElementById("registerAddress").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) return showNotification("Passwords do not match", "error");
    if (password.length < 6) return showNotification("Password must be at least 6 characters", "error");

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, phone, address, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showNotification(`Registration successful! ID: ${data.customer_id}`, "success");
            setTimeout(async () => {
                await handleAutoLogin(username, password);
            }, 2000);
        } else {
            showNotification(data.error || "Registration failed.", "error");
        }
    } catch (error) {
        console.error(error);
        showNotification("Registration failed. Try again.", "error");
    }
}

/**
 * Auto-login after registration
 */
async function handleAutoLogin(username, password) {
    const loginResponse = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const loginData = await loginResponse.json();
    if (loginResponse.ok && loginData.success) {
        localStorage.setItem("currentUser", JSON.stringify(loginData.user));
        showNotification("Auto-login successful! Redirecting...", "success");
        window.location.href = "/";
    }
}

/**
 * Logout
 */
function logout() {
    localStorage.removeItem("currentUser");
    showNotification("Logged out successfully!", "success");
    setTimeout(() => window.location.href = "/", 1000);
}

/**
 * Show user details
 */
function showUserDetails(user) {
    alert(`User Details:\n\nUsername: ${user.username}\nEmail: ${user.email}\nPhone: ${user.phone}\nAddress: ${user.address}`);
}

/**
 * Update Navbar: Replace Login with username dropdown on ALL pages
 */
function updateNavbar() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const loginLink = document.querySelector(".nav-link[href='/login']");

    if (!loginLink) return;

    if (currentUser) {
        const dropdown = document.createElement("li");
        dropdown.classList.add("nav-item", "dropdown");
        dropdown.style.position = "relative";

        dropdown.innerHTML = `
            <a href="#" class="nav-link dropdown-toggle" id="userDropdown">Welcome, ${currentUser.username} ▼</a>
            <ul class="dropdown-menu" style="
                display: none;
                position: absolute;
                top: 40px;
                right: 0;
                background: white;
                list-style: none;
                padding: 10px;
                margin: 0;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                min-width: 150px;
                z-index: 1000;
            ">
                <li><a href="#" id="viewDetails" style="display:block; padding:8px; color:#333; text-decoration:none;">View Details</a></li>
                <li><a href="#" id="logoutBtn" style="display:block; padding:8px; color:#333; text-decoration:none;">Logout</a></li>
            </ul>
        `;

        loginLink.parentNode.replaceChild(dropdown, loginLink);

        const dropdownToggle = dropdown.querySelector("#userDropdown");
        const dropdownMenu = dropdown.querySelector(".dropdown-menu");

        dropdownToggle.addEventListener("click", (e) => {
            e.preventDefault();
            dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
        });

        document.addEventListener("click", (event) => {
            if (!dropdown.contains(event.target)) {
                dropdownMenu.style.display = "none";
            }
        });

        document.getElementById("viewDetails").addEventListener("click", () => showUserDetails(currentUser));
        document.getElementById("logoutBtn").addEventListener("click", logout);
    } else {
        loginLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/login"; // Show login page
        });
    }
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        color: white;
        font-weight: bold;
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
    `;
    notification.style.background = type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#007bff";

    document.body.appendChild(notification);

    setTimeout(() => { notification.style.opacity = "1"; }, 10);
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.addEventListener('transitionend', () => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, { once: true });
    }, 3000);
}
