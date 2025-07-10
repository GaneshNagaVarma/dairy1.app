// Global variables
let currentUser = null;
const chatState = {
    isLoggedIn: false,
    loginAttempts: 0,
    awaitingOTP: false,
    awaitingNewPassword: false,
    tempPhone: null,
    tempUsername: null,
    // New chat states for login/register flow
    awaitingUsernameInput: false, // For login username
    awaitingPasswordInput: false, // For login password
    awaitingRegisterData: false, // Overall flag for registration
    registerStep: null, // Tracks current step in registration (username, password, etc.)
    registerData: {}, // Stores data during registration
    resetPasswordPhone: null, // Stores phone number during forgot password flow
    resetPasswordToken: null, // Stores token after OTP verification
    tempNewPassword: null, // Stores the first new password input during reset flow
    awaitingPasswordConfirm: false, // Flag for new password confirmation
};

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
    loadUserFromStorage();
    // Update initial bot message on load
    addBotMessage("Hello! I'm your farm assistant, **Bujji**. How can I help you today?");
    addBotMessage("You can say: login, register, products, about, shopping, orders, my details, logout, forgot password.");

    // Initial check for products page to display products if on that page
    if (window.location.pathname === '/products') {
        showProductsOneByOne();
    }
});

// Check if user is logged in
function checkLoginStatus() {
    const user = localStorage.getItem("currentUser");
    if (user) {
        currentUser = JSON.parse(user);
        chatState.isLoggedIn = true;
        updateUIForLoggedInUser();
    }
}

// Load user data from localStorage (redundant with checkLoginStatus but harmless)
function loadUserFromStorage() {
    const user = localStorage.getItem("currentUser");
    if (user) {
        currentUser = JSON.parse(user);
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const loginLink = document.querySelector('a[href="/login"]');
    if (loginLink && currentUser) {
        loginLink.textContent = `Welcome, ${currentUser.username}`;
        loginLink.href = "#"; // Make it not navigate, as user is already logged in
    }
}

// Chatbot functionality
function toggleChat() {
    const chatbot = document.getElementById("chatbot");
    const chatBody = chatbot.querySelector(".chat-body"); // Get the chat-body specifically

    chatbot.classList.toggle("open"); // Toggles the 'open' class on the #chatbot container

    if (chatbot.classList.contains("open")) {
        chatBody.style.display = "flex"; // Show the chat body
        chatBody.style.height = "400px"; // Set its height for transition
        document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;
    } else {
        chatBody.style.height = "0"; // Collapse height
        // Use a timeout to hide display after transition completes
        setTimeout(() => {
            chatBody.style.display = "none";
        }, 300); // Matches the CSS transition duration
    }
}

function handleEnter(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

function sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value.trim();

    if (message === "") return;

    addUserMessage(message);
    input.value = "";

    // Process the message
    setTimeout(() => {
        processChatMessage(message.toLowerCase(), message); // Pass original message for case-sensitive needs if any
    }, 500);
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = "user-message";
    messageDiv.innerHTML = `<p>${message}</p>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(message) {
    const messagesContainer = document.getElementById("chatMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = "bot-message";
    messageDiv.innerHTML = `<p>${message}</p>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function processChatMessage(lowerCaseMessage, originalMessage) {
    // --- State-based message handling (highest priority) ---

    // Handle Forgot Password flow
    // Changed 'awaitingPhone' to 'chatState.awaitingPhone' for consistency and clarity
    if (chatState.awaitingPhone) {
        handleForgotPasswordPhone(originalMessage);
        return;
    }
    if (chatState.awaitingOTP) {
        handleOTPVerification(lowerCaseMessage);
        return;
    }
    if (chatState.awaitingNewPassword) {
        handleNewPasswordInput(originalMessage); // Use originalMessage for password
        return;
    }
    if (chatState.awaitingPasswordConfirm) {
        handleNewPasswordConfirmation(originalMessage); // Use originalMessage for password
        return;
    }

    // Handle Login flow
    if (chatState.awaitingUsernameInput) {
        chatState.tempUsername = originalMessage; // Store the username
        chatState.awaitingUsernameInput = false; // Reset state
        chatState.awaitingPasswordInput = true; // Move to next state
        addBotMessage("Please enter your password:");
        return;
    }
    if (chatState.awaitingPasswordInput) {
        const username = chatState.tempUsername;
        const password = originalMessage; // Get the password
        chatState.awaitingPasswordInput = false; // Reset state
        chatState.tempUsername = null; // Clear temp username
        performLogin(username, password); // Call the new login function
        return;
    }

    // Handle Register flow
    if (chatState.awaitingRegisterData) {
        handleRegisterInput(originalMessage);
        return;
    }

    // --- Command-based message handling (if no state is active) ---

    // Handle login process
    if (lowerCaseMessage.includes("login") && !chatState.isLoggedIn) {
        startLoginProcess();
        return;
    } else if (lowerCaseMessage.includes("login") && chatState.isLoggedIn) {
        addBotMessage("You are already logged in!");
        return;
    }

    // Handle register process
    if (lowerCaseMessage.includes("register") && !chatState.isLoggedIn) {
        startRegisterProcess();
        return;
    } else if (lowerCaseMessage.includes("register") && chatState.isLoggedIn) {
        addBotMessage("You are already logged in. Please logout first if you wish to register a new account.");
        return;
    }

    // Handle forgot password
    if (lowerCaseMessage.includes("forgot password")) {
        startForgotPasswordProcess();
        return;
    }

    // Handle logout
    if (lowerCaseMessage.includes("logout") && chatState.isLoggedIn) {
        handleLogout();
        return;
    } else if (lowerCaseMessage.includes("logout") && !chatState.isLoggedIn) {
        addBotMessage("You are not currently logged in.");
        return;
    }

    // Handle my details
    if (lowerCaseMessage.includes("my details") && chatState.isLoggedIn) {
        showUserDetails();
        return;
    } else if (lowerCaseMessage.includes("my details") && !chatState.isLoggedIn) {
        addBotMessage("Please login first to view your details.");
        return;
    }

    // Handle my orders - MODIFIED LOGIC
    if (lowerCaseMessage.includes("my orders") || lowerCaseMessage.includes("my order")) {
        if (chatState.isLoggedIn) {
            // Directly call fetchAndShowOrders, which will handle redirection
            fetchAndShowOrders();
        } else {
            addBotMessage("Please login first to view your orders. Type 'login' to start the login process.");
        }
        return; // Important: return after handling
    }

    // Handle products and show available products
    if (lowerCaseMessage.includes("products")) {
        addBotMessage("Redirecting to products page...");
        setTimeout(() => {
            window.location.href = "/products";
        }, 1000);
        return;
    }

    // Handle cart
    if (lowerCaseMessage.includes("cart")) {
        handleCartCommand(); // New function for cart
        return;
    }

    // Navigation commands
    if (lowerCaseMessage.includes("home")) {
        addBotMessage("Redirecting to home page...");
        setTimeout(() => (window.location.href = "/"), 1000);
        return;
    }

    if (lowerCaseMessage.includes("about")) {
        addBotMessage("Redirecting to about page...");
        setTimeout(() => (window.location.href = "/about"), 1000);
        return;
    }

    if (lowerCaseMessage.includes("shopping")) {
        if (chatState.isLoggedIn) {
            addBotMessage("Redirecting to shopping page...");
            setTimeout(() => (window.location.href = "/shopping"), 1000);
        } else {
            addBotMessage("Please login first to access the shopping page.");
        }
        return;
    }

    // Default response
    addBotMessage(
        "I can help you with: login, register, products, about, shopping, orders, my details, logout, forgot password. You can also navigate to different pages by mentioning them.",
    );
}

// --- Login Process Functions ---
function startLoginProcess() {
    addBotMessage("To log in, please enter your username:");
    chatState.awaitingUsernameInput = true;
    chatState.loginAttempts = 0; // Reset attempts for a new login process
}

async function performLogin(username, password) {
    addBotMessage("Attempting to log you in...");
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            currentUser = data.user;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            chatState.isLoggedIn = true;
            chatState.loginAttempts = 0; // Reset attempts on successful login
            updateUIForLoggedInUser();
            addBotMessage(`Welcome back, ${currentUser.username}! You are now logged in.`);
            addBotMessage("What would you like to do next? You can ask for 'my details', 'my orders', or browse 'products'.");
        } else {
            chatState.loginAttempts++;
            if (chatState.loginAttempts >= 3) {
                addBotMessage("Too many failed login attempts. For security, please try again later or type 'forgot password' to reset your password.");
                // Reset all login-related states to stop the current login flow
                chatState.tempUsername = null;
                chatState.awaitingUsernameInput = false;
                chatState.awaitingPasswordInput = false;
            } else {
                addBotMessage(`Login failed: ${data.error || 'Invalid username or password'}. Please try again.`);
                addBotMessage("Please enter your username:"); // Re-prompt for username to restart login
                chatState.awaitingUsernameInput = true; // Set state back to awaiting username
            }
        }
    } catch (error) {
        console.error('Error during login API call:', error);
        addBotMessage("An error occurred during login. Please try again later.");
        // Ensure all login states are reset on unexpected error
        chatState.tempUsername = null;
        chatState.awaitingUsernameInput = false;
        chatState.awaitingPasswordInput = false;
    }
}


// --- Registration Process Functions ---
function startRegisterProcess() {
    addBotMessage("Let me help you register. Please provide the following information:");
    addBotMessage("First, what is your desired **username**?");
    chatState.awaitingRegisterData = true;
    chatState.registerStep = "username";
    chatState.registerData = {}; // Clear any previous registration data
}

async function handleRegisterInput(message) {
    switch (chatState.registerStep) {
        case "username":
            if (!message.trim()) { addBotMessage("Username cannot be empty. Please enter your desired username:"); return; }
            chatState.registerData.username = message.trim();
            addBotMessage("Great! Now, please enter your **password** (at least 6 characters long):");
            chatState.registerStep = "password";
            break;
        case "password":
            if (message.length < 6) { addBotMessage("Password must be at least 6 characters long. Please try again:"); return; }
            chatState.registerData.password = message;
            addBotMessage("Please **confirm your password**:");
            chatState.registerStep = "confirm_password";
            break;
        case "confirm_password":
            if (message !== chatState.registerData.password) {
                addBotMessage("Passwords do not match. Please re-enter your password:");
                chatState.registerStep = "password"; // Go back to re-entering password
                chatState.registerData.password = null; // Clear the previous password
                return;
            }
            chatState.registerData.confirm_password = message;
            addBotMessage("What is your **email address**?");
            chatState.registerStep = "email";
            break;
        case "email":
            // Basic email validation
            if (!/\S+@\S+\.\S+/.test(message)) { addBotMessage("Please enter a valid email address:"); return; }
            chatState.registerData.email = message.trim();
            addBotMessage("What is your **phone number**?");
            chatState.registerStep = "phone";
            break;
        case "phone":
            // Basic phone validation (digits only, minimum length)
            if (!/^\d{10,}$/.test(message)) { addBotMessage("Please enter a valid phone number (digits only, at least 10 digits):"); return; }
            chatState.registerData.phone = message.trim();
            addBotMessage("Finally, what is your full **address** (e.g., 123 Main St, City, State, Zip)?");
            chatState.registerStep = "address";
            break;
        case "address":
            if (!message.trim()) { addBotMessage("Address cannot be empty. Please enter your full address:"); return; }
            chatState.registerData.address = message.trim();
            addBotMessage("Thank you! Attempting to register your account...");
            await performRegistration(chatState.registerData);
            // Reset states after registration attempt
            chatState.awaitingRegisterData = false;
            chatState.registerStep = null;
            chatState.registerData = {};
            break;
        default:
            addBotMessage("Something went wrong with registration. Please type 'register' to start again.");
            chatState.awaitingRegisterData = false;
            chatState.registerStep = null;
            chatState.registerData = {};
    }
}

async function performRegistration(userData) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            addBotMessage("Registration successful! Attempting to log you in automatically...");

            // **MODIFICATION 1: Auto-login after successful registration**
            const loginResponse = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: userData.username, password: userData.password }),
            });
            const loginData = await loginResponse.json();

            if (loginResponse.ok && loginData.success) {
                currentUser = loginData.user;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                chatState.isLoggedIn = true;
                chatState.loginAttempts = 0;
                updateUIForLoggedInUser();
                addBotMessage(`Welcome, ${currentUser.username}! You are now logged in and redirected to shopping.`);
                setTimeout(() => {
                    window.location.href = "/shopping"; // **MODIFICATION 2: Redirect to shopping.html**
                }, 1000);
            } else {
                addBotMessage(`Automatic login failed: ${loginData.error || 'An unexpected error occurred.'}. Please try logging in manually.`);
                addBotMessage(`Your Customer ID is: ${data.customer_id}.`); // Still show customer ID
            }

        } else {
            addBotMessage(`Registration failed: ${data.error || 'An unexpected error occurred.'}. Please try again.`);
        }
    } catch (error) {
        console.error('Error during registration or auto-login API call:', error);
        addBotMessage("An error occurred during registration. Please try again later.");
    }
}


// --- Forgot Password Process Functions ---
function startForgotPasswordProcess() {
    addBotMessage("To reset your password, please enter your **phone number** linked to your account:");
    chatState.awaitingPhone = true;
    chatState.resetPasswordPhone = null;
    chatState.resetPasswordToken = null;
    chatState.awaitingOTP = false;
    chatState.awaitingNewPassword = false;
    chatState.awaitingPasswordConfirm = false;
    chatState.tempNewPassword = null;
}

async function handleForgotPasswordPhone(phone) {
    if (!phone.trim() || !/^\d+$/.test(phone.trim())) {
        addBotMessage("Please provide a valid phone number (digits only) to reset your password.");
        return;
    }
    chatState.resetPasswordPhone = phone.trim();
    addBotMessage(`Sending OTP to ${chatState.resetPasswordPhone}...`);
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: chatState.resetPasswordPhone }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
            addBotMessage("An OTP has been sent to your phone. Please enter the **6-digit OTP**:");
            chatState.awaitingPhone = false; // Phone received, now awaiting OTP
            chatState.awaitingOTP = true;
        } else {
            addBotMessage(`Error: ${data.error || 'Could not send OTP. Please check your phone number and try again.'}`);
            chatState.awaitingPhone = false; // Reset state if failed to send OTP
            chatState.resetPasswordPhone = null;
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        addBotMessage("An error occurred while trying to send OTP. Please try again later.");
        chatState.awaitingPhone = false;
        chatState.resetPasswordPhone = null;
    }
}

async function handleOTPVerification(otp) {
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
        addBotMessage("Please enter a valid 6-digit OTP.");
        return;
    }
    addBotMessage("Verifying OTP...");
    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: chatState.resetPasswordPhone, otp }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
            addBotMessage("OTP verified successfully! Please enter your **new password** (at least 6 characters long):");
            chatState.awaitingOTP = false;
            chatState.awaitingNewPassword = true;
            chatState.resetPasswordToken = data.reset_token; // Store token from backend for next step
        } else {
            addBotMessage(`OTP verification failed: ${data.error || 'Invalid or expired OTP. Please try again.'}`);
            // Keep awaiting OTP if it was just a wrong OTP, otherwise, reset flow
            addBotMessage('If you want to restart the process, type "forgot password".');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        addBotMessage("An error occurred during OTP verification. Please try again later.");
        chatState.awaitingOTP = false; // Reset state on error
    }
}

function handleNewPasswordInput(password) {
    if (password.length < 6) {
        addBotMessage("New password must be at least 6 characters long. Please try again:");
        return;
    }
    addBotMessage("Please **confirm your new password**:");
    chatState.tempNewPassword = password;
    chatState.awaitingPasswordConfirm = true;
    chatState.awaitingNewPassword = false;
}

async function handleNewPasswordConfirmation(confirmPassword) {
    if (confirmPassword !== chatState.tempNewPassword) {
        addBotMessage("Passwords do not match. Please re-enter your new password:");
        chatState.awaitingNewPassword = true; // Go back to asking for new password
        chatState.awaitingPasswordConfirm = false;
        chatState.tempNewPassword = null; // Clear the first password
        return;
    }

    addBotMessage("Resetting your password...");
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reset_token: chatState.resetPasswordToken, // Use the token received from verify-otp
                new_password: chatState.tempNewPassword,
                confirm_password: confirmPassword,
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            addBotMessage("Your password has been successfully reset! You can now log in with your new password.");
            // Clear all temp states related to password reset
            chatState.awaitingPasswordConfirm = false;
            chatState.tempNewPassword = null;
            chatState.resetPasswordPhone = null;
            chatState.resetPasswordToken = null;
        } else {
            addBotMessage(`Password reset failed: ${data.error || 'An unexpected error occurred.'}. Please try again.`);
            // Guide them to restart the flow
            startForgotPasswordProcess();
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        addBotMessage("An error occurred during password reset. Please try again later.");
        // Ensure all states are cleared on critical error
        chatState.awaitingPasswordConfirm = false;
        chatState.tempNewPassword = null;
        chatState.resetPasswordPhone = null;
        chatState.resetPasswordToken = null;
    }
}

// --- Logout Function ---
async function handleLogout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        if (response.ok && data.success) {
            localStorage.removeItem("currentUser");
            currentUser = null;
            chatState.isLoggedIn = false;
            chatState.loginAttempts = 0;
            addBotMessage("You have been logged out successfully.");
            updateUIForLoggedInUser(); // Update navbar link
            setTimeout(() => (window.location.href = "/"), 1000);
        } else {
            addBotMessage(`Logout failed: ${data.error || 'An error occurred during logout.'}`);
        }
    } catch (error) {
        console.error('Error during logout API call:', error);
        addBotMessage("An error occurred during logout. Please try again later.");
    }
}


// --- User Details Function ---
function showUserDetails() {
    if (currentUser) {
        addBotMessage(`Your Details:
            Customer ID: ${currentUser.customer_id}
            Username: ${currentUser.username}
            Email: ${currentUser.email}
            Phone: ${currentUser.phone}
            Address: ${currentUser.address}`);
    } else {
        addBotMessage("I cannot show your details because you are not logged in.");
    }
}

// --- Orders Function - MODIFIED LOGIC ---
async function fetchAndShowOrders() {
    addBotMessage("Redirecting to your orders page..."); // Immediate message
    setTimeout(() => {
        window.location.href = "/orders"; // Always redirect to orders.html
    }, 1000); // 1-second delay for the message to show
}

// --- Cart Command Function ---
function handleCartCommand() {
    // For now, assuming "cart" implies navigating to the shopping page
    addBotMessage("Redirecting you to the shopping page, where you can view and manage your cart.");
    setTimeout(() => {
        window.location.href = "/shopping";
    }, 1000);
}


// --- Products Display (for products.html) ---
async function showProductsOneByOne() {
    const productsContainer = document.getElementById('products-display-area');

    if (!productsContainer) {
        console.warn("Products display area (div with id='products-display-area') not found on this page. Cannot display products.");
        return;
    }

    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();

        if (products.length === 0) {
            productsContainer.innerHTML = '<p>No products available at the moment. Please check back later!</p>';
            addBotMessage("Currently, there are no products available.");
            return;
        }

        productsContainer.innerHTML = ''; // Clear any loading message
        addBotMessage("Here are our available products:");

        products.forEach((product, index) => {
            setTimeout(() => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product-item'; // Add a class for styling
                productDiv.innerHTML = `
                    <img src="${product.image_url || '/placeholder.svg?height=200&width=200'}" alt="${product.name}" class="product-image">
                    <h4>${product.name}</h4>
                    <p>Category: ${product.category}</p>
                    <p>Price: $${product.price.toFixed(2)}</p>
                    <p>${product.description || 'No description available.'}</p>
                    <p>Stock: ${product.stock_quantity > 0 ? product.stock_quantity : 'Out of Stock'}</p>
                `;
                productsContainer.appendChild(productDiv);
                // Ensure the chat messages container also scrolls if new product messages are added there
                const chatMessagesContainer = document.getElementById("chatMessages");
                if (chatMessagesContainer) {
                    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                }
            }, index * 1000); // 1-second delay per product
        });
    } catch (error) {
        console.error('Error fetching and displaying products:', error);
        productsContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
        addBotMessage("I encountered an error while trying to fetch the product list. Please try again later.");
    }
}


// Hamburger menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector(".nav-menu");
    const hamburger = document.querySelector(".hamburger");

    navMenu.classList.toggle("active");
    hamburger.classList.toggle("active");
}