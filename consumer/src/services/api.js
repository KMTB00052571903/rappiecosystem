const API_URL = 'https://rappiecosystem-oopf.vercel.app/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
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
  localStorage.setItem('token', data.session.access_token)
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
  return data
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
