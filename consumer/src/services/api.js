const API_URL = 'https://rappiecosystem-oopf.vercel.app/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No estás autenticado. Por favor inicia sesión.')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// AUTH
export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  // Use optional chaining: if session or access_token is missing, storing
  // undefined would write the literal string "undefined" to localStorage,
  // causing every subsequent request to send "Bearer undefined" → 401.
  const token = data.session?.access_token
  if (!token) throw new Error('La respuesta del servidor no contiene un token válido')
  localStorage.setItem('token', token)
  return data
}

export async function registerUser({ email, password, role, name }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, name }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

// STORES
export async function fetchStores() {
  const res = await fetch(`${API_URL}/stores`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  // Normalise is_open → isOpen in case the DB column comes back in snake_case
  return data.map(store => ({
    ...store,
    isOpen: store.isOpen ?? store.is_open ?? false,
  }))
}

// PRODUCTS
export async function fetchProducts(storeId) {
  const url = storeId ? `${API_URL}/products?storeId=${storeId}` : `${API_URL}/products`
  const res = await fetch(url, { headers: getAuthHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

// ORDERS
export async function fetchMyOrders() {
  const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function createOrder({ storeId, items, destinationLat, destinationLng }) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ storeId, items, destinationLat, destinationLng }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function fetchOrderById(orderId) {
  const res = await fetch(`${API_URL}/orders/${orderId}`, { headers: getAuthHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}
