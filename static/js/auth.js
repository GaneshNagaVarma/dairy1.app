// auth.js - Client-side Authentication Functionality

document.addEventListener("DOMContentLoaded", () => {
    // Check authentication status when the DOM is fully loaded
    checkAuthStatus();
});

/**
 * Checks if a user is already authenticated (logged in) based on localStorage.
 * If logged in, redirects to the shopping page.
 */
function checkAuthStatus() {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        console.log("User already logged in:", JSON.parse(currentUser));
        // User is already logged in, redirect to shopping
        window.location.href = "/shopping";
    } else {
        console.log("No user currently logged in.");
    }
}

/**
 * Displays the login form and hides the registration form.
 */
function showLoginForm() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("registerForm").style.display = "none";
}

/**
 * Displays the registration form and hides the login form.
 */
function showRegisterForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
}

/**
 * Handles the login form submission.
 * Sends user credentials to the Flask /api/login endpoint.
 * @param {Event} event - The form submission event.
 */
async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        const data = await response.json(); // Parse the JSON response from the server

        if (response.ok && data.success) { // Check for successful HTTP status and success flag
            // Store the logged-in user data in localStorage
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            showNotification("Login successful! Redirecting...", "success"); // Show success notification
            setTimeout(() => {
                window.location.href = "/shopping"; // Redirect after a short delay
            }, 1500);
        } else {
            // Handle login failure
            showNotification(data.error || "Login failed. Please check your credentials.", "error");
            console.error("Login failed:", data.error);
        }
    } catch (error) {
        console.error("Login error:", error);
        showNotification("Login failed. Please try again.", "error");
    }
}

/**
 * Handles the registration form submission.
 * Sends user registration details to the Flask /api/register endpoint.
 * @param {Event} event - The form submission event.
 */
async function handleRegister(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const phone = document.getElementById("registerPhone").value;
    const address = document.getElementById("registerAddress").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Client-side validation
    if (password !== confirmPassword) {
        showNotification("Passwords do not match", "error");
        return;
    }

    if (password.length < 6) {
        showNotification("Password must be at least 6 characters long", "error");
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                email: email,
                phone: phone,
                address: address,
                password: password,
                confirm_password: confirmPassword, // Send to backend for confirmation (optional, but good for consistency)
            }),
        });

        const data = await response.json(); // Parse the JSON response

        if (response.ok && data.success) { // Check for successful HTTP status and success flag
            showNotification(`Registration successful! Your Customer ID is: ${data.customer_id}`, "success");

            // Auto-login after successful registration
            setTimeout(async () => {
                const loginResponse = await fetch("/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                });

                const loginData = await loginResponse.json();
                if (loginResponse.ok && loginData.success) {
                    localStorage.setItem("currentUser", JSON.stringify(loginData.user));
                    showNotification("Auto-login successful! Redirecting...", "success");
                    window.location.href = "/shopping";
                } else {
                    showNotification(loginData.error || "Auto-login failed after registration.", "error");
                    console.error("Auto-login failed:", loginData.error);
                }
            }, 2000); // Give user a moment to read registration success message
        } else {
            // Handle registration failure
            showNotification(data.error || "Registration failed. Please try again.", "error");
            console.error("Registration failed:", data.error);
        }
    } catch (error) {
        console.error("Registration error:", error);
        showNotification("Registration failed. Please try again.", "error");
    }
}

/**
 * Displays a temporary notification message on the screen.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error' to determine background color.
 */
function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.textContent = message;

    // Apply basic styles
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

    // Set background color based on type
    if (type === "success") {
        notification.style.background = "#28a745"; // Green
    } else if (type === "error") {
        notification.style.background = "#dc3545"; // Red
    } else {
        notification.style.background = "#007bff"; // Blue (default info)
    }

    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
        notification.style.opacity = "1";
    }, 10); // Small delay to allow reflow before transition

    // Fade out and remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = "0";
        // Remove from DOM after transition completes
        notification.addEventListener('transitionend', () => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, { once: true });
    }, 3000);
}