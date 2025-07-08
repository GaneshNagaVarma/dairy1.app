// Shopping cart
let cart = []
const products = []

// Load products and cart on page load
document.addEventListener("DOMContentLoaded", () => {
  loadShoppingProducts("all")
  loadCart()
  updateCartUI()
})

// Products data (same as products.js but with shopping functionality)
const shoppingProductsData = [
  {
    id: 1,
    name: "Fresh Whole Milk",
    category: "dairy",
    price: 4.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Premium quality whole milk from grass-fed cows",
    details:
      "Rich in calcium and protein. Perfect for drinking, cooking, and baking. Our cows graze on organic pastures ensuring the highest quality milk.",
    stock: 50,
  },
  {
    id: 2,
    name: "Organic Butter",
    category: "dairy",
    price: 6.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Creamy organic butter made from fresh cream",
    details:
      "Made from the cream of grass-fed cows. No artificial additives or preservatives. Perfect for cooking and spreading.",
    stock: 30,
  },
  {
    id: 3,
    name: "Aged Cheddar Cheese",
    category: "dairy",
    price: 12.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Sharp aged cheddar cheese, aged for 12 months",
    details:
      "Aged to perfection for 12 months. Rich, sharp flavor that melts beautifully. Great for sandwiches, cooking, or enjoying on its own.",
    stock: 25,
  },
  {
    id: 4,
    name: "Greek Yogurt",
    category: "dairy",
    price: 5.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Thick and creamy Greek yogurt",
    details: "High in protein and probiotics. Made with live active cultures. Available in various flavors or plain.",
    stock: 40,
  },
  {
    id: 5,
    name: "Premium Ground Beef",
    category: "meat",
    price: 8.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Lean ground beef from grass-fed cattle",
    details:
      "85% lean ground beef from cattle raised on our farm. No hormones or antibiotics. Perfect for burgers, meatballs, and more.",
    stock: 20,
  },
  {
    id: 6,
    name: "Free-Range Chicken",
    category: "meat",
    price: 12.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Whole free-range chicken",
    details: "Raised on open pastures with access to natural feed. No antibiotics or hormones. Fresh and tender.",
    stock: 15,
  },
  {
    id: 7,
    name: "Pork Tenderloin",
    category: "meat",
    price: 15.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Tender pork tenderloin",
    details:
      "Lean and tender cut from heritage breed pigs. Raised humanely on our farm. Perfect for roasting or grilling.",
    stock: 12,
  },
  {
    id: 8,
    name: "Farm Fresh Eggs",
    category: "dairy",
    price: 3.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Fresh eggs from free-range hens",
    details: "Collected daily from our free-range hens. Rich golden yolks and firm whites. Perfect for any meal.",
    stock: 60,
  },
]

function loadShoppingProducts(category) {
  const shoppingGrid = document.getElementById("shoppingGrid")
  const filteredProducts =
    category === "all" ? shoppingProductsData : shoppingProductsData.filter((p) => p.category === category)

  shoppingGrid.innerHTML = ""

  filteredProducts.forEach((product) => {
    const productCard = createShoppingProductCard(product)
    shoppingGrid.appendChild(productCard)
  })
}

function createShoppingProductCard(product) {
  const card = document.createElement("div")
  card.className = "product-card"

  card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn btn-primary" onclick="showProductDetails(${product.id})">View Details</button>
                <button class="btn btn-secondary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `

  return card
}

function filterShoppingProducts(category) {
  // Update active button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  // Load filtered products
  loadShoppingProducts(category)
}

function showProductDetails(productId) {
  const product = shoppingProductsData.find((p) => p.id === productId)
  if (!product) return

  const modal = document.getElementById("productModal")
  const productDetails = document.getElementById("productDetails")

  productDetails.innerHTML = `
        <div class="product-detail-content">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 300px; margin-bottom: 1rem;">
            <h2>${product.name}</h2>
            <p class="product-price" style="font-size: 1.5rem; color: #ff6b35; margin: 1rem 0;">${product.price.toFixed(2)}</p>
            <p><strong>Description:</strong> ${product.description}</p>
            <p><strong>Details:</strong> ${product.details}</p>
            <p><strong>Stock:</strong> ${product.stock} available</p>
            <div class="product-actions" style="margin-top: 2rem;">
                <button class="btn btn-secondary" onclick="addToCart(${product.id})" style="margin-right: 1rem;">Add to Cart</button>
                <button class="btn btn-primary" onclick="buyNow(${product.id})">Buy Now</button>
            </div>
        </div>
    `

  modal.style.display = "block"
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none"
}

function addToCart(productId) {
  const product = shoppingProductsData.find((p) => p.id === productId)
  if (!product) return

  const existingItem = cart.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity += 1
  } else {
    cart.push({
      ...product,
      quantity: 1,
    })
  }

  saveCart()
  updateCartUI()
  showNotification(`${product.name} added to cart!`)
}

function buyNow(productId) {
  addToCart(productId)
  toggleCart()
}

function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar")
  cartSidebar.classList.toggle("open")
}

function updateCartUI() {
  const cartCount = document.getElementById("cartCount")
  const cartItems = document.getElementById("cartItems")
  const cartTotal = document.getElementById("cartTotal")

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  cartCount.textContent = totalItems

  // Update cart items
  cartItems.innerHTML = ""

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty</p>"
    cartTotal.textContent = "0.00"
    return
  }

  cart.forEach((item) => {
    const cartItem = document.createElement("div")
    cartItem.className = "cart-item"

    cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toFixed(2)} each</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-total">
                <p>${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart(${item.id})" style="background: #ff4444; color: white; border: none; padding: 5px; border-radius: 3px; cursor: pointer;">Remove</button>
            </div>
        `

    cartItems.appendChild(cartItem)
  })

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  cartTotal.textContent = total.toFixed(2)
}

function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId)
  if (!item) return

  item.quantity += change

  if (item.quantity <= 0) {
    removeFromCart(productId)
  } else {
    saveCart()
    updateCartUI()
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  saveCart()
  updateCartUI()
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function loadCart() {
  const savedCart = localStorage.getItem("cart")
  if (savedCart) {
    cart = JSON.parse(savedCart)
  }
}

function proceedToCheckout() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!")
    return
  }

  // Check if user is logged in
  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) {
    showNotification("Please login to proceed with checkout")
    window.location.href = "/login"
    return
  }

  document.getElementById("checkoutModal").style.display = "block"
}

function closeCheckoutModal() {
  document.getElementById("checkoutModal").style.display = "none"
}

// Handle payment method change
document.addEventListener("DOMContentLoaded", () => {
  const paymentMethod = document.getElementById("paymentMethod")
  if (paymentMethod) {
    paymentMethod.addEventListener("change", function () {
      const cardDetails = document.getElementById("cardDetails")
      if (this.value === "credit_card" || this.value === "debit_card") {
        cardDetails.style.display = "block"
      } else {
        cardDetails.style.display = "none"
      }
    })
  }
})

// Handle checkout form submission
document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById("checkoutForm")
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault()
      processOrder()
    })
  }
})

function processOrder() {
  const paymentMethod = document.getElementById("paymentMethod").value
  const deliveryAddress = document.getElementById("deliveryAddress").value

  if (!paymentMethod || !deliveryAddress) {
    showNotification("Please fill in all required fields")
    return
  }

  // Create order
  const order = {
    id: "ORD" + Date.now(),
    items: [...cart],
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    paymentMethod: paymentMethod,
    deliveryAddress: deliveryAddress,
    status: "pending",
    orderDate: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
  }

  // Save order
  const orders = JSON.parse(localStorage.getItem("orders") || "[]")
  orders.push(order)
  localStorage.setItem("orders", JSON.stringify(orders))

  // Clear cart
  cart = []
  saveCart()
  updateCartUI()

  // Close modals
  closeCheckoutModal()
  toggleCart()

  // Show success message
  showNotification("Order placed successfully! Order ID: " + order.id)

  // Redirect to orders page
  setTimeout(() => {
    window.location.href = "/orders"
  }, 2000)
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #2c5530;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `
  notification.textContent = message

  document.body.appendChild(notification)

  // Remove notification after 3 seconds
  setTimeout(() => {
    document.body.removeChild(notification)
  }, 3000)
}

// Close modals when clicking outside
window.addEventListener("click", (event) => {
  const productModal = document.getElementById("productModal")
  const checkoutModal = document.getElementById("checkoutModal")

  if (event.target === productModal) {
    closeProductModal()
  }

  if (event.target === checkoutModal) {
    closeCheckoutModal()
  }
})
