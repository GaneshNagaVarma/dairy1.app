// Products data
const productsData = [
  {
    id: 1,
    name: "Fresh Whole Milk",
    category: "dairy",
    price: 4.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Premium quality whole milk from grass-fed cows",
    details:
      "Rich in calcium and protein. Perfect for drinking, cooking, and baking. Our cows graze on organic pastures ensuring the highest quality milk.",
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
  },
  {
    id: 4,
    name: "Greek Yogurt",
    category: "dairy",
    price: 5.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Thick and creamy Greek yogurt",
    details: "High in protein and probiotics. Made with live active cultures. Available in various flavors or plain.",
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
  },
  {
    id: 6,
    name: "Free-Range Chicken",
    category: "meat",
    price: 12.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Whole free-range chicken",
    details: "Raised on open pastures with access to natural feed. No antibiotics or hormones. Fresh and tender.",
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
  },
  {
    id: 8,
    name: "Farm Fresh Eggs",
    category: "dairy",
    price: 3.99,
    image: "/placeholder.svg?height=200&width=200",
    description: "Fresh eggs from free-range hens",
    details: "Collected daily from our free-range hens. Rich golden yolks and firm whites. Perfect for any meal.",
  },
]

// Load products on page load
document.addEventListener("DOMContentLoaded", () => {
  loadProducts("all")
})

function loadProducts(category) {
  const productsGrid = document.getElementById("productsGrid")
  const filteredProducts = category === "all" ? productsData : productsData.filter((p) => p.category === category)

  productsGrid.innerHTML = ""

  filteredProducts.forEach((product) => {
    const productCard = createProductCard(product)
    productsGrid.appendChild(productCard)
  })
}

function createProductCard(product) {
  const card = document.createElement("div")
  card.className = "product-card"

  card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-details">
                <p><strong>Details:</strong> ${product.details}</p>
            </div>
        </div>
    `

  return card
}

function filterProducts(category) {
  // Update active button
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  event.target.classList.add("active")

  // Load filtered products
  loadProducts(category)
}
