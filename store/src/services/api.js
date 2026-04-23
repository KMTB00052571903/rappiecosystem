const API_URL = 'https://rappiecosystem-oopf.vercel.app/api'

function getHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// AUTH
export async function loginStore(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  if (data.session?.access_token) {
    localStorage.setItem('token', data.session.access_token)
  }
  return data
}

export async function registerStore({ email, password, storeName }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'store', storeName }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

// STORE
export async function fetchMyStore() {
  const res = await fetch(`${API_URL}/stores/me`, { headers: getHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function toggleStore(storeId, isOpen) {
  const res = await fetch(`${API_URL}/stores/${storeId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ isOpen }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

// PRODUCTS
export async function fetchProducts(storeId) {
  const res = await fetch(`${API_URL}/products?storeId=${storeId}`, { headers: getHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function createProduct({ name, price, storeId }) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, price, storeId }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function updateProduct(product) {
  const res = await fetch(`${API_URL}/products/${product.id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ name: product.name, price: product.price }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}

export async function deleteProduct(productId) {
  const res = await fetch(`${API_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }
  return true
}

// ORDERS
export async function fetchStoreOrders(storeId) {
  const res = await fetch(`${API_URL}/orders?storeId=${storeId}`, { headers: getHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message)
  return data
}
