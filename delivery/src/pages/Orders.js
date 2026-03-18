import { fetchOrders } from '../services/api.js'
import { OrderCard } from '../components/OrderCard.js'
import { getSession } from '../context/session.js'

export async function renderOrders(status = 'pendiente') {
  const ordersGrid = document.getElementById('ordersGrid')
  const loading = document.getElementById('loading')
  const noOrders = document.getElementById('noOrders')

  // =========================
  // 🔒 VALIDAR SESIÓN
  // =========================
  const repartidor = getSession()

  if (!repartidor) {
    ordersGrid.innerHTML = '<p class="error-message">Debes iniciar sesión</p>'
    return
  }

  // =========================
  // 🔄 LOADING
  // =========================
  ordersGrid.innerHTML = ''
  loading.classList.remove('hidden')
  noOrders.classList.add('hidden')

  try {
    // ⚠️ Por ahora fetchOrders NO usa parámetros (mock)
    const orders = await fetchOrders()

    // =========================
    // ✅ RENDER
    // =========================
    loading.classList.add('hidden')
    ordersGrid.innerHTML = ''

    if (!orders || orders.length === 0) {
      noOrders.classList.remove('hidden')
      return
    }

    orders.forEach(order => {
      const card = OrderCard(order)
      ordersGrid.appendChild(card)
    })

  } catch (err) {
    console.error(err)

    loading.classList.add('hidden')
    ordersGrid.innerHTML = `
      <p class="error-message">
        Error al cargar pedidos 😢
      </p>
    `
  }
}