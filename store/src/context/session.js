let currentStore = JSON.parse(localStorage.getItem('store_session')) || null

export function setSession(store) {
  currentStore = store
  localStorage.setItem('store_session', JSON.stringify(store))
}

export function getSession() {
  return currentStore
}

export function clearSession() {
  currentStore = null
  localStorage.removeItem('store_session')
  localStorage.removeItem('token')
}

export function isAuthenticated() {
  return !!currentStore
}
