let currentStore = JSON.parse(localStorage.getItem('store_user')) || null

// =========================
// 🏪 SESSION STORE
// =========================

export function setSession(store) {
  currentStore = store
  localStorage.setItem('store_user', JSON.stringify(store))
}

export function getSession() {
  return currentStore
}

export function clearSession() {
  currentStore = null
  localStorage.removeItem('store_user')
  localStorage.removeItem('token')
}

// =========================
// 🔁 AUTO LOGIN
// =========================

export function isAuthenticated() {
  return !!currentStore
}