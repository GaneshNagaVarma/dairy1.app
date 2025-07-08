// Load orders on page load
document.addEventListener("DOMContentLoaded", () => {
  loadOrders()
})

function loadOrders() {
  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) {
    document.getElementById("ordersContainer").innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p>Please <a href="/login">login</a> to view your orders.</p>
            </div>
        `
    return
  }

  const orders = JSON.parse(localStorage.getItem("orders") || "[]")
  const ordersContainer = document.getElementById("ordersContainer")

  if (orders.length === 0) {
    ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p>You haven't placed any orders yet.</p>
                <a href="/shopping" class="btn btn-primary">Start Shopping</a>
            </div>
        `
    return
  }

  ordersContainer.innerHTML = ""

  // Sort orders by date (newest first)
  orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))

  orders.forEach((order) => {
    const orderCard = createOrderCard(order)
    ordersContainer.appendChild(orderCard)
  })
}

function createOrderCard(order) {
  const card = document.createElement("div")
  card.className = "order-card"

  const orderDate = new Date(order.orderDate).toLocaleDateString()
  const estimatedDelivery = new Date(order.estimatedDelivery).toLocaleDateString()

  card.innerHTML = `
        <div class="order-header">
            <div>
                <h3>Order #${order.id}</h3>
                <p>Placed on: ${orderDate}</p>
            </div>
            <div class="order-status status-${order.status}">
                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
        </div>
        
        <div class="order-items">
            <h4>Items:</h4>
            ${order.items
              .map(
                (item) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                    <div>
                        <strong>${item.name}</strong>
                        <span style="color: #666;"> x${item.quantity}</span>
                    </div>
                    <div>$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            `,
              )
              .join("")}
        </div>
        
        <div class="order-details" style="margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Payment Method:</span>
                <span>${order.paymentMethod.replace("_", " ").toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Delivery Address:</span>
                <span>${order.deliveryAddress}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Estimated Delivery:</span>
                <span>${estimatedDelivery}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #2c5530;">
                <span>Total:</span>
                <span>$${order.total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="order-actions" style="margin-top: 1rem; text-align: center;">
            <button class="btn btn-primary" onclick="trackOrder('${order.id}')">Track Order</button>
            ${order.status === "pending" ? `<button class="btn btn-secondary" onclick="cancelOrder('${order.id}')" style="margin-left: 1rem;">Cancel Order</button>` : ""}
        </div>
    `

  return card
}

function trackOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders") || "[]")
  const order = orders.find((o) => o.id === orderId)

  if (!order) return

  // Simulate order tracking
  const trackingSteps = [
    { status: "pending", message: "Order received and being processed", completed: true },
    { status: "processing", message: "Order is being prepared", completed: order.status !== "pending" },
    {
      status: "shipped",
      message: "Order has been shipped",
      completed: order.status === "shipped" || order.status === "delivered",
    },
    { status: "delivered", message: "Order delivered successfully", completed: order.status === "delivered" },
  ]

  let trackingHTML = `
        <div style="max-width: 500px; margin: 0 auto;">
            <h3>Tracking Order #${orderId}</h3>
            <div style="margin: 2rem 0;">
    `

  trackingSteps.forEach((step, index) => {
    trackingHTML += `
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="width: 20px; height: 20px; border-radius: 50%; background: ${step.completed ? "#2c5530" : "#ddd"}; margin-right: 1rem;"></div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: ${step.completed ? "#2c5530" : "#666"};">${step.message}</div>
                </div>
            </div>
        `
  })

  trackingHTML += `
            </div>
            <button onclick="closeTrackingModal()" class="btn btn-primary">Close</button>
        </div>
    `

  // Create modal
  const modal = document.createElement("div")
  modal.id = "trackingModal"
  modal.className = "modal"
  modal.style.display = "block"
  modal.innerHTML = `
        <div class="modal-content">
            ${trackingHTML}
        </div>
    `

  document.body.appendChild(modal)
}

function closeTrackingModal() {
  const modal = document.getElementById("trackingModal")
  if (modal) {
    document.body.removeChild(modal)
  }
}

function cancelOrder(orderId) {
  if (confirm("Are you sure you want to cancel this order?")) {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]")
    const orderIndex = orders.findIndex((o) => o.id === orderId)

    if (orderIndex !== -1) {
      orders[orderIndex].status = "cancelled"
      localStorage.setItem("orders", JSON.stringify(orders))
      loadOrders() // Reload orders
      showNotification("Order cancelled successfully")
    }
  }
}

function showNotification(message) {
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

  setTimeout(() => {
    document.body.removeChild(notification)
  }, 3000)
}
