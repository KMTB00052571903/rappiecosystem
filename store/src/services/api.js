const API_URL = 'https://rappiecosystem-oopf.vercel.app/api'

// =========================
// 🔑 TOKEN HELPER
// =========================
function getHeaders() {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// =========================
// 🔐 AUTH (TIENDA)
// =========================
export async function loginStore(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) throw new Error('Error en login')

    const data = await res.json()

    // 🔥 guardar token
    if (data.session?.access_token) {
      localStorage.setItem('token', data.session.access_token)
    }

    return data.user || data
  } catch (err) {
    console.error('Login error:', err)
    return null
  }
}

export async function registerStore(data) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        role: 'admin', // 🔥 tienda = admin
      }),
    })

    if (!res.ok) throw new Error('Error en registro')

    const result = await res.json()
    return result
  } catch (err) {
    console.error('Register error:', err)
    return null
  }
}

// =========================
// 📦 PRODUCTS
// =========================
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, {
      headers: getHeaders(),
    })

    if (!res.ok) throw new Error('Error al obtener productos')

    return await res.json()
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function updateProduct(product) {
  try {
    const res = await fetch(`${API_URL}/products/${product.id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(product),
    })

    if (!res.ok) throw new Error('Error al actualizar producto')

    return await res.json()
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function deleteProduct(productId) {
  try {
    const res = await fetch(`${API_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })

    if (!res.ok) throw new Error('Error al eliminar producto')

    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

// =========================
// 🧾 ORDERS (TIENDA)
// =========================
export async function fetchStoreOrders() {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: getHeaders(),
    })

    if (!res.ok) throw new Error('Error al obtener pedidos')

    return await res.json()
  } catch (err) {
    console.error(err)
    return []
  }
}