import { fetchStoreOrders } from '../services/api.js'
import { OrderCard } from '../components/OrderCard.js'
import { getSession } from '../context/session.js'

export async function renderOrders() {
  const ordersGrid = document.getElementById('ordersGrid')
  const loading = document.getElementById('loading')
  const noData = document.getElementById('noData')

  // =========================
  // 🔒 VALIDAR SESIÓN
  // =========================
  const store = getSession()

  if (!store) {
    ordersGrid.innerHTML = '<p class="error-message">Debes iniciar sesión</p>'
    return
  }

  // =========================
  // 🔄 LOADING
  // =========================
  ordersGrid.innerHTML = ''
  loading.classList.remove('hidden')
  noData.classList.add('hidden')

  try {
    // ⚠️ por ahora puede no existir backend → fallback
    const orders = await fetchStoreOrders?.(store.id) || []

    loading.classList.add('hidden')
    ordersGrid.innerHTML = ''

    if (!orders || orders.length === 0) {
      noData.classList.remove('hidden')
      return
    }

    orders.forEach(order => {
      const card = OrderCard(order, async (updated) => {
        console.log('Actualizar orden (futuro backend):', updated)
      })

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