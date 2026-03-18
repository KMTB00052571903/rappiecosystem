const API_URL = "https://rappiecosystem-backend.vercel.app/api";

// =========================
// 🔐 AUTH (es el mismo que consumer)
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

    localStorage.setItem("token", data.session.access_token);

    return data.user;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// =========================
// 🧾 ORDERS (FAKE POR AHORA)
// =========================

export async function fetchOrders() {
  // ⚠️ aún no existe backend → mock temporal
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