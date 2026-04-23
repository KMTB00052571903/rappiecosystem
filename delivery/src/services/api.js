const API_URL = 'https://rappiecosystem-oopf.vercel.app/api'

function getHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
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
  if (data.session?.access_token) localStorage.setItem('token', data.session.access_token)
  return data
}

export async function registerUser({ email, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'delivery' }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

// ORDERS
export async function fetchAvailableOrders() {
  const res = await fetch(`${API_URL}/orders?status=available`, { headers: getHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function fetchMyDeliveries(deliveryId) {
  const res = await fetch(`${API_URL}/orders?deliveryId=${deliveryId}`, { headers: getHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function acceptOrder(orderId) {
  const res = await fetch(`${API_URL}/orders/${orderId}/accept`, {
    method: 'PATCH',
    headers: getHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function updatePosition(orderId, lat, lng) {
  const res = await fetch(`${API_URL}/orders/${orderId}/position`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ lat, lng }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data  // { status, arrived }
}
