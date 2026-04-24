import { fetchStoreOrders } from '../services/api.js'
import { getSession } from '../context/session.js'

const SUPABASE_URL = 'https://yusnextkfjdjrjbotitk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1c25leHRrZmpkanJqYm90aXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDEyNzAsImV4cCI6MjA4OTE3NzI3MH0.GEHYjCrGQVYIKWgdRWIWu2DP83TdpnUNNIDQn8_N7b8'

const STATUS_BADGE = {
  'Creado':     '<span class="badge badge-created">Creado</span>',
  'En entrega': '<span class="badge badge-delivery">En entrega</span>',
  'Entregado':  '<span class="badge badge-done">Entregado</span>',
}

let realtimeChannel = null

export async function renderOrders() {
  const ordersGrid = document.getElementById('ordersGrid')
  const loading = document.getElementById('loading')
  const noData = document.getElementById('noData')

  const session = getSession()
  if (!session?.storeId) {
    ordersGrid.innerHTML = '<p>No se encontró la tienda.</p>'
    return
  }

  ordersGrid.innerHTML = ''
  loading.classList.remove('hidden')
  noData.classList.add('hidden')

  try {
    const orders = await fetchStoreOrders(session.storeId)
    loading.classList.add('hidden')
    ordersGrid.innerHTML = ''

    if (!orders || orders.length === 0) {
      noData.classList.remove('hidden')
      return
    }

    orders.forEach(order => ordersGrid.appendChild(buildOrderCard(order)))

    subscribeRealtime(session.storeId)
  } catch (err) {
    loading.classList.add('hidden')
    ordersGrid.innerHTML = `<p class="error">Error al cargar pedidos: ${err.message}</p>`
  }
}

function buildOrderCard(order) {
  const card = document.createElement('div')
  card.className = 'card-item order-card'
  card.dataset.orderId = order.id

  const badge = STATUS_BADGE[order.status] || `<span class="badge">${order.status}</span>`
  const items = (order.order_items || [])
    .map(i => `${i.products?.name || 'Producto'} x${i.quantity}`)
    .join(', ')

  card.innerHTML = `
    <div class="order-header">
      <span class="order-id">Pedido #${order.id.slice(0, 8)}</span>
      ${badge}
    </div>
    <p style="font-size:13px;margin-top:6px;">${items || 'Sin items'}</p>
    <p style="font-size:11px;color:#888;">${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</p>
  `
  return card
}

function updateOrderBadge(orderId, newStatus) {
  const card = document.querySelector(`[data-order-id="${orderId}"]`)
  if (!card) return
  const badgeEl = card.querySelector('.badge')
  if (!badgeEl) return
  badgeEl.className = 'badge ' + (newStatus === 'Creado' ? 'badge-created' : newStatus === 'En entrega' ? 'badge-delivery' : 'badge-done')
  badgeEl.textContent = newStatus
}

function subscribeRealtime(storeId) {
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)

  // Use Broadcast (not Postgres Changes) on the store-specific channel.
  // Delivery app broadcasts to store:${storeId} after every position PATCH.
  realtimeChannel = supabase
    .channel(`store:${storeId}`)
    .on('broadcast', { event: 'order-update' }, ({ payload }) => {
      updateOrderBadge(payload.orderId, payload.status)
    })
    .subscribe()
}
