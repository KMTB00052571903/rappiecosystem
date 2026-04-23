import { fetchAvailableOrders, fetchMyDeliveries, acceptOrder, updatePosition } from '../services/api.js'
import { OrderCard } from '../components/OrderCard.js'
import { getSession } from '../context/session.js'

const SUPABASE_URL = 'https://yusnextkfjdjrjbotitk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1c25leHRrZmpkanJqYm90aXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDEyNzAsImV4cCI6MjA4OTE3NzI3MH0.GEHYjCrGQVYIKWgdRWIWu2DP83TdpnUNNIDQn8_N7b8'

const STEP = 0.00005  // ~5 metros

let deliveryMap = null
let deliveryMarker = null
let broadcastChannel = null
let activeOrderId = null
let isDelivered = false

// Throttle state
let throttleTimer = null
let pendingLat = null
let pendingLng = null
let currentLat = null
let currentLng = null

export async function renderOrders(tab = 'pending') {
  const ordersGrid = document.getElementById('ordersGrid')
  const loading = document.getElementById('loading')
  const noOrders = document.getElementById('noOrders')

  const user = getSession()
  if (!user) {
    ordersGrid.innerHTML = '<p>Debes iniciar sesión</p>'
    return
  }

  ordersGrid.innerHTML = ''
  loading.classList.remove('hidden')
  noOrders.classList.add('hidden')

  try {
    let orders
    if (tab === 'pending') {
      orders = await fetchAvailableOrders()
    } else {
      orders = await fetchMyDeliveries(user.id)
    }

    loading.classList.add('hidden')
    ordersGrid.innerHTML = ''

    if (!orders || orders.length === 0) {
      noOrders.classList.remove('hidden')
      return
    }

    orders.forEach(order => {
      const card = OrderCard(order, handleAccept)
      ordersGrid.appendChild(card)
    })
  } catch (err) {
    loading.classList.add('hidden')
    ordersGrid.innerHTML = `<p class="error">Error: ${err.message}</p>`
  }
}

async function handleAccept(order) {
  try {
    const accepted = await acceptOrder(order.id)
    alert('¡Pedido aceptado! Usa las flechas del teclado para moverte.')
    openDeliveryMap(accepted)
  } catch (err) {
    alert('Error al aceptar: ' + err.message)
  }
}

function openDeliveryMap(order) {
  isDelivered = false
  activeOrderId = order.id

  // Parse destination
  let destLat = 4.711, destLng = -74.072
  if (order.destination?.coordinates) {
    destLng = order.destination.coordinates[0]
    destLat = order.destination.coordinates[1]
  }

  // Show map section, hide orders
  document.getElementById('ordersSection').classList.add('hidden')
  const mapSection = document.getElementById('deliveryMapSection')
  mapSection.classList.remove('hidden')
  document.getElementById('activeOrderInfo').textContent = `Pedido #${order.id.slice(0, 8)}`

  // Init position near destination (start 0.001 deg away)
  currentLat = destLat + 0.001
  currentLng = destLng

  // Init Leaflet map
  if (deliveryMap) { deliveryMap.remove(); deliveryMap = null }
  deliveryMap = window.L.map('deliveryMap').setView([currentLat, currentLng], 16)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(deliveryMap)

  // Delivery marker
  deliveryMarker = window.L.marker([currentLat, currentLng], {
    icon: window.L.divIcon({ className: '', html: '🛵', iconSize: [30, 30] })
  }).addTo(deliveryMap).bindPopup('Tu posición').openPopup()

  // Destination marker
  window.L.marker([destLat, destLng], {
    icon: window.L.divIcon({ className: '', html: '📍', iconSize: [30, 30] })
  }).addTo(deliveryMap).bindPopup('Destino de entrega').openPopup()

  // Subscribe to broadcast channel
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  if (broadcastChannel) supabase.removeChannel(broadcastChannel)
  broadcastChannel = supabase.channel(`order-${order.id}`)
  broadcastChannel.subscribe()

  // Start listening for arrow keys
  window.addEventListener('keydown', handleKeyDown)

  document.getElementById('closeMapBtn').onclick = () => {
    cleanupMap()
    document.getElementById('deliveryMapSection').classList.add('hidden')
    document.getElementById('ordersSection').classList.remove('hidden')
    renderOrders('accepted')
  }
}

function handleKeyDown(e) {
  if (isDelivered) return

  let moved = false
  switch (e.key) {
    case 'ArrowUp':    currentLat += STEP; moved = true; break
    case 'ArrowDown':  currentLat -= STEP; moved = true; break
    case 'ArrowLeft':  currentLng -= STEP; moved = true; break
    case 'ArrowRight': currentLng += STEP; moved = true; break
    default: return
  }

  e.preventDefault()

  // Move marker immediately
  deliveryMarker.setLatLng([currentLat, currentLng])
  deliveryMap.panTo([currentLat, currentLng])

  // Store pending position
  pendingLat = currentLat
  pendingLng = currentLng

  // Throttle: send PATCH at most once per second
  if (throttleTimer) return
  throttleTimer = setTimeout(async () => {
    const lat = pendingLat
    const lng = pendingLng
    throttleTimer = null

    try {
      const result = await updatePosition(activeOrderId, lat, lng)

      // Broadcast position to consumers via Supabase
      if (broadcastChannel) {
        broadcastChannel.send({
          type: 'broadcast',
          event: 'position-update',
          payload: { lat, lng, status: result.status },
        })
      }

      if (result.arrived) {
        isDelivered = true
        window.removeEventListener('keydown', handleKeyDown)
        document.getElementById('deliveredBanner').classList.remove('hidden')
        setTimeout(() => {
          cleanupMap()
          document.getElementById('deliveryMapSection').classList.add('hidden')
          document.getElementById('ordersSection').classList.remove('hidden')
          renderOrders('accepted')
        }, 3000)
      }
    } catch (err) {
      console.error('Error updating position:', err.message)
    }
  }, 1000)
}

function cleanupMap() {
  window.removeEventListener('keydown', handleKeyDown)
  if (throttleTimer) { clearTimeout(throttleTimer); throttleTimer = null }
  if (deliveryMap) { deliveryMap.remove(); deliveryMap = null }
  deliveryMarker = null
  if (broadcastChannel) {
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    supabase.removeChannel(broadcastChannel)
    broadcastChannel = null
  }
  activeOrderId = null
  isDelivered = false
  document.getElementById('deliveredBanner').classList.add('hidden')
}
