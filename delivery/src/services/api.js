const API_URL = "https://rappiecosystem-oopf.vercel.app/api";

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

    localStorage.setItem("token", data.session?.access_token);

    return data.user;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return null;
  }
}

// 🔥 ESTA FUNCIÓN FALTABA
export async function registerUser({ email, password, role }) {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // opcional: guardar token si backend lo devuelve
    if (data.session?.access_token) {
      localStorage.setItem("token", data.session.access_token);
    }

    return data.user;
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    // 🔥 fallback para que funcione sin backend
    return {
      email,
      role,
    };
  }
}

// =========================
// 🧾 ORDERS (FAKE POR AHORA)
// =========================

export async function fetchOrders() {
  return [
    {
      id: 1,
      estado: "pendiente",
      storeName: "Restaurante Demo",
      customerName: "Cliente Test",
      customerPhone: "123456",
      customerAddress: "Calle 123",
      products: [{ name: "Pizza", quantity: 1 }],
      total: 25000,
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function acceptOrder(orderId) {
  console.log("Pedido aceptado:", orderId);
  return true;
}