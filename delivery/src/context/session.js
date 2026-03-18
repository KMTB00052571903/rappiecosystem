let currentUser = JSON.parse(localStorage.getItem('delivery_user')) || null

// =========================
// 👤 SESSION
// =========================

export function setSession(user) {
  currentUser = user
  localStorage.setItem('delivery_user', JSON.stringify(user))
}

export function getSession() {
  return currentUser
}

export function clearSession() {
  currentUser = null
  localStorage.removeItem('delivery_user')
  localStorage.removeItem('token')
}

// =========================
// 🔁 AUTO LOGIN
// =========================

export function isAuthenticated() {
  return !!currentUser
}