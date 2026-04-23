let currentUser = JSON.parse(localStorage.getItem('consumer_user')) || null
let cart = JSON.parse(localStorage.getItem('cart')) || []
let currentStoreId = localStorage.getItem('cart_store_id') || null

// SESSION
export function setSession(user) {
  currentUser = user
  localStorage.setItem('consumer_user', JSON.stringify(user))
}

export function getSession() {
  return currentUser
}

export function clearSession() {
  currentUser = null
  cart = []
  currentStoreId = null
  localStorage.removeItem('consumer_user')
  localStorage.removeItem('token')
  localStorage.removeItem('cart')
  localStorage.removeItem('cart_store_id')
}

// CART
export function addToCart(product) {
  if (currentStoreId && currentStoreId !== product.storeId) {
    if (!confirm('Tu carrito tiene productos de otra tienda. ¿Vaciarlo y agregar este?')) return
    clearCart()
  }
  currentStoreId = product.storeId
  localStorage.setItem('cart_store_id', product.storeId)
  cart.push(product)
  localStorage.setItem('cart', JSON.stringify(cart))
}

export function removeFromCart(productId) {
  cart = cart.filter(p => p.id !== productId)
  localStorage.setItem('cart', JSON.stringify(cart))
  if (cart.length === 0) {
    currentStoreId = null
    localStorage.removeItem('cart_store_id')
  }
}

export function getCart() {
  return cart
}

export function getCartStoreId() {
  return currentStoreId
}

export function clearCart() {
  cart = []
  currentStoreId = null
  localStorage.setItem('cart', JSON.stringify(cart))
  localStorage.removeItem('cart_store_id')
}
