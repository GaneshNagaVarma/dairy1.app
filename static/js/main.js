// Global variables
let currentUser = null
const chatState = {
  isLoggedIn: false,
  loginAttempts: 0,
  awaitingOTP: false,
  awaitingNewPassword: false,
  tempPhone: null,
  tempUsername: null,
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus()
  loadUserFromStorage()
})

// Check if user is logged in
function checkLoginStatus() {
  const user = localStorage.getItem("currentUser")
  if (user) {
    currentUser = JSON.parse(user)
    chatState.isLoggedIn = true
    updateUIForLoggedInUser()
  }
}

// Load user data from localStorage
function loadUserFromStorage() {
  const user = localStorage.getItem("currentUser")
  if (user) {
    currentUser = JSON.parse(user)
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  const loginLink = document.querySelector('a[href="/login"]')
  if (loginLink && currentUser) {
    loginLink.textContent = `Welcome, ${currentUser.username}`
    loginLink.href = "#"
  }
}

// Chatbot functionality
function toggleChat() {
  const chatbot = document.getElementById("chatbot")
  chatbot.classList.toggle("open")
}

function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage()
  }
}

function sendMessage() {
  const input = document.getElementById("chatInput")
  const message = input.value.trim()

  if (message === "") return

  addUserMessage(message)
  input.value = ""

  // Process the message
  setTimeout(() => {
    processChatMessage(message.toLowerCase())
  }, 500)
}

function addUserMessage(message) {
  const messagesContainer = document.getElementById("chatMessages")
  const messageDiv = document.createElement("div")
  messageDiv.className = "user-message"
  messageDiv.innerHTML = `<p>${message}</p>`
  messagesContainer.appendChild(messageDiv)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function addBotMessage(message) {
  const messagesContainer = document.getElementById("chatMessages")
  const messageDiv = document.createElement("div")
  messageDiv.className = "bot-message"
  messageDiv.innerHTML = `<p>${message}</p>`
  messagesContainer.appendChild(messageDiv)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function processChatMessage(message) {
  // Handle different chat states
  if (chatState.awaitingOTP) {
    handleOTPVerification(message)
    return
  }

  if (chatState.awaitingNewPassword) {
    handleNewPasswordInput(message)
    return
  }

  // Handle login process
  if (message.includes("login") && !chatState.isLoggedIn) {
    startLoginProcess()
    return
  }

  // Handle register process
  if (message.includes("register") && !chatState.isLoggedIn) {
    startRegisterProcess()
    return
  }

  // Handle forgot password
  if (message.includes("forgot password")) {
    startForgotPasswordProcess()
    return
  }

  // Handle logout
  if (message.includes("logout") && chatState.isLoggedIn) {
    handleLogout()
    return
  }

  // Handle my details
  if (message.includes("my details") && chatState.isLoggedIn) {
    showUserDetails()
    return
  }

  // Navigation commands
  if (message.includes("home")) {
    addBotMessage("Redirecting to home page...")
    setTimeout(() => (window.location.href = "/"), 1000)
    return
  }

  if (message.includes("products")) {
    addBotMessage("Redirecting to products page...")
    setTimeout(() => (window.location.href = "/products"), 1000)
    return
  }

  if (message.includes("about")) {
    addBotMessage("Redirecting to about page...")
    setTimeout(() => (window.location.href = "/about"), 1000)
    return
  }

  if (message.includes("shopping")) {
    if (chatState.isLoggedIn) {
      addBotMessage("Redirecting to shopping page...")
      setTimeout(() => (window.location.href = "/shopping"), 1000)
    } else {
      addBotMessage("Please login first to access the shopping page.")
    }
    return
  }

  if (message.includes("orders") || message.includes("order")) {
    if (chatState.isLoggedIn) {
      addBotMessage("Redirecting to orders page...")
      setTimeout(() => (window.location.href = "/orders"), 1000)
    } else {
      addBotMessage("Please login first to view your orders.")
    }
    return
  }

  // Default response
  addBotMessage(
    "I can help you with: login, register, products, about, shopping, orders, my details, logout, forgot password. You can also navigate to different pages by mentioning them.",
  )
}

function startLoginProcess() {
  addBotMessage("Please enter your username:")
  chatState.awaitingUsername = true
}

function startRegisterProcess() {
  addBotMessage("Let me help you register. Please provide the following information:")
  addBotMessage("Username:")
  chatState.awaitingRegisterData = true
  chatState.registerStep = "username"
  chatState.registerData = {}
}

function startForgotPasswordProcess() {
  addBotMessage("Please enter your phone number to reset your password:")
  chatState.awaitingPhone = true
}

function handleLogout() {
  localStorage.removeItem("currentUser")
  currentUser = null
  chatState.isLoggedIn = false
  chatState.loginAttempts = 0
  addBotMessage("You have been logged out successfully.")
  setTimeout(() => (window.location.href = "/"), 1000)
}

function showUserDetails() {
  if (currentUser) {
    const maskedPassword = "•".repeat(currentUser.password.length)
    addBotMessage(`Your Details:
        Customer ID: ${currentUser.customer_id}
        Username: ${currentUser.username}
        Email: ${currentUser.email}
        Phone: ${currentUser.phone}
        Address: ${currentUser.address}
        Password: ${maskedPassword}`)
  }
}

function handleOTPVerification(otp) {
  // Simulate OTP verification
  if (otp === "123456") {
    // Mock OTP
    addBotMessage("OTP verified successfully! Please enter your new password:")
    chatState.awaitingOTP = false
    chatState.awaitingNewPassword = true
  } else {
    addBotMessage('Invalid OTP. Please try again or type "forgot password" to restart.')
    chatState.awaitingOTP = false
  }
}

function handleNewPasswordInput(password) {
  addBotMessage("Please confirm your new password:")
  chatState.tempNewPassword = password
  chatState.awaitingPasswordConfirm = true
  chatState.awaitingNewPassword = false
}

// Simulate API calls
async function simulateLogin(username, password) {
  // Mock user database
  const users = [
    {
      customer_id: "CUS06654",
      username: "john_doe",
      password: "password123",
      email: "john@example.com",
      phone: "1234567890",
      address: "123 Main St, City, State",
    },
    {
      customer_id: "CUS06655",
      username: "jane_smith",
      password: "mypassword",
      email: "jane@example.com",
      phone: "0987654321",
      address: "456 Oak Ave, City, State",
    },
  ]

  const user = users.find((u) => u.username === username && u.password === password)
  return user || null
}

async function simulateRegister(userData) {
  // Generate unique customer ID
  const customerId =
    "CUS" +
    Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0")

  const newUser = {
    customer_id: customerId,
    ...userData,
  }

  // In a real app, this would save to database
  return newUser
}

// Hamburger menu toggle
function toggleMobileMenu() {
  const navMenu = document.querySelector(".nav-menu")
  const hamburger = document.querySelector(".hamburger")

  navMenu.classList.toggle("active")
  hamburger.classList.toggle("active")
}

// Add event listener for hamburger menu
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger")
  if (hamburger) {
    hamburger.addEventListener("click", toggleMobileMenu)
  }
})
