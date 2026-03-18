const API_URL = "https://rappiecosystem-backend.vercel.app/api";

// 🔧 Helper para headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// =========================
// 🔐 AUTH
// =========================

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // 🔥 guardar token
    localStorage.setItem("token", data.session.access_token);

    return data;
  } catch (err) {
    console.error("Login error:", err.message);
    return null;
  }
}

export async function registerUser({ email, password, role }) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (err) {
    console.error("Register error:", err.message);
    return null;
  }
}

// =========================
// 🏪 STORES (cuando lo implementes)
// =========================

export async function fetchStores() {
  try {
    const res = await fetch(`${API_URL}/stores`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (err) {
    console.error("Fetch stores error:", err.message);
    return [];
  }
}

// =========================
// 📦 PRODUCTS
// =========================

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/posts`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (err) {
    console.error("Fetch products error:", err.message);
    return [];
  }
}

// =========================
// 🧾 ORDERS (pendiente backend)
// =========================

export async function fetchOrders() {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (err) {
    console.error("Fetch orders error:", err.message);
    return [];
  }
}

export async function createOrder(orderData) {
  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    return data;
  } catch (err) {
    console.error("Create order error:", err.message);
    return null;
  }
}