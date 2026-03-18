let currentUser = JSON.parse(localStorage.getItem("user")) || null
let cart = JSON.parse(localStorage.getItem("cart")) || []

// =========================
// 👤 SESSION
// =========================

export function setSession(user) {
  currentUser = user
  localStorage.setItem("user", JSON.stringify(user))
}

export function getSession() {
  return currentUser
}

export function clearSession() {
  currentUser = null
  cart = []
  localStorage.removeItem("user")
  localStorage.removeItem("token")
  localStorage.removeItem("cart")
}

// =========================
// 🛒 CART
// =========================

export function addToCart(product) {
  cart.push(product)
  localStorage.setItem("cart", JSON.stringify(cart))
}

export function removeFromCart(productId) {
  cart = cart.filter(p => p.id !== productId)
  localStorage.setItem("cart", JSON.stringify(cart))
}

export function getCart() {
  return cart
}

export function clearCart() {
  cart = []
  localStorage.setItem("cart", JSON.stringify(cart))
}