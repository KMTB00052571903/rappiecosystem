import { fetchAvailableOrders, fetchMyDeliveries, acceptOrder, updatePosition } from '../services/api.js'
import { OrderCard } from '../components/OrderCard.js'
import { getSession } from '../context/session.js'

const SUPABASE_URL = 'https://yusnextkfjdjrjbotitk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1c25leHRrZmpkanJqYm90aXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDEyNzAsImV4cCI6MjA4OTE3NzI3MH0.GEHYjCrGQVYIKWgdRWIWu2DP83TdpnUNNIDQn8_N7b8'

const STEP = 0.00005  // ~5 meters per key press

let deliveryMap = null
let deliveryMarker = null
let supabaseClient = null
let orderChannel = null   // channel for consumer tracking: order:${orderId}
let storeChannel = null   // channel for store status: store:${storeId}
let activeOrderId = null
let activeStoreId = null
let isDelivered = false

// Throttle refs (pendingPosition pattern from requirements)
let throttleTimer = null
let pendingLat = null
let pendingLng = null
let currentLat = null
let currentLng = null

// ─── render orders list ───────────────────────────────────────────────────────

export async function renderOrders(tab = 'pending') {
  const ordersGrid = document.getElementById('ordersGrid')
  const loading = document.getElementById('loading')
  const noOrders = document.getElementById('noOrders')

  const user = getSession()
  if (!user) { ordersGrid.innerHTML = '<p>Debes iniciar sesión</p>'; return }

  ordersGrid.innerHTML = ''
  loading.classList.remove('hidden')
  noOrders.classList.add('hidden')

  try {
    const orders = tab === 'pending'
      ? await fetchAvailableOrders()
      : await fetchMyDeliveries(user.id)

    loading.classList.add('hidden')
    ordersGrid.innerHTML = ''

    if (!orders || orders.length === 0) { noOrders.classList.remove('hidden'); return }

    orders.forEach(order => ordersGrid.appendChild(OrderCard(order, handleAccept)))
  } catch (err) {
    loading.classList.add('hidden')
    ordersGrid.innerHTML = `<p class="error">Error: ${err.message}</p>`
  }
}

// ─── accept + open map ────────────────────────────────────────────────────────

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
  activeStoreId = order.store_id  // needed for store broadcast

  // Parse destination — Supabase returns PostGIS geography as GeoJSON by default,
  // but guard against a plain {lat,lng} object and log if neither matches.
  let destLat = 4.711, destLng = -74.072
  const dest = order.destination
  if (dest?.coordinates) {
    // GeoJSON Point: coordinates = [lng, lat]
    destLng = dest.coordinates[0]
    destLat = dest.coordinates[1]
  } else if (dest?.lat !== undefined && dest?.lng !== undefined) {
    destLat = dest.lat
    destLng = dest.lng
  } else {
    console.warn('[map] destination format not recognized — using fallback coords', dest)
  }

  // Show map section
  document.getElementById('ordersSection').classList.add('hidden')
  document.getElementById('deliveryMapSection').classList.remove('hidden')
  document.getElementById('activeOrderInfo').textContent = `Pedido #${order.id.slice(0, 8)}`

  // Start slightly away from destination so movement is visible
  currentLat = destLat + 0.001
  currentLng = destLng

  // Init Leaflet map
  if (deliveryMap) { deliveryMap.remove(); deliveryMap = null }
  deliveryMap = window.L.map('deliveryMap').setView([currentLat, currentLng], 16)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(deliveryMap)

  deliveryMarker = window.L.marker([currentLat, currentLng], {
    icon: window.L.divIcon({ className: '', html: '🛵', iconSize: [30, 30] })
  }).addTo(deliveryMap).bindPopup('Tu posición').openPopup()

  window.L.marker([destLat, destLng], {
    icon: window.L.divIcon({ className: '', html: '📍', iconSize: [30, 30] })
  }).addTo(deliveryMap).bindPopup('Destino de entrega')

  // Subscribe to Supabase Broadcast channels (delivery is the sender)
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

  if (orderChannel) supabaseClient.removeChannel(orderChannel)
  orderChannel = supabaseClient.channel(`order:${order.id}`)
  orderChannel.subscribe()  // delivery app needs to subscribe before it can send

  if (storeChannel) supabaseClient.removeChannel(storeChannel)
  if (activeStoreId) {
    storeChannel = supabaseClient.channel(`store:${activeStoreId}`)
    storeChannel.subscribe()
  }

  window.addEventListener('keydown', handleKeyDown)

  document.getElementById('closeMapBtn').onclick = () => {
    cleanupMap()
    document.getElementById('deliveryMapSection').classList.add('hidden')
    document.getElementById('ordersSection').classList.remove('hidden')
    renderOrders('accepted')
  }
}

// ─── keyboard movement ────────────────────────────────────────────────────────

function handleKeyDown(e) {
  if (isDelivered) return  // STOP movement once delivered

  switch (e.key) {
    case 'ArrowUp':    currentLat += STEP; break
    case 'ArrowDown':  currentLat -= STEP; break
    case 'ArrowLeft':  currentLng -= STEP; break
    case 'ArrowRight': currentLng += STEP; break
    default: return
  }
  e.preventDefault()

  // 1. Update local marker immediately (visual feedback)
  deliveryMarker.setLatLng([currentLat, currentLng])
  deliveryMap.panTo([currentLat, currentLng])

  // 2. Track most-recent pending position (pendingPosition ref pattern)
  pendingLat = currentLat
  pendingLng = currentLng

  // 3. Throttle: only one PATCH per second regardless of key frequency
  if (throttleTimer) return
  throttleTimer = setTimeout(sendPositionUpdate, 1000)
}

async function sendPositionUpdate() {
  const lat = pendingLat
  const lng = pendingLng
  throttleTimer = null

  try {
    // PATCH → updates delivery_position in DB, runs ST_DWithin check
    const result = await updatePosition(activeOrderId, lat, lng)

    // After DB update: broadcast position to consumer via order channel
    if (orderChannel) {
      orderChannel.send({
        type: 'broadcast',
        event: 'position-update',
        payload: { lat, lng, status: result.status },
      })
    }

    // Also broadcast status update to store channel
    if (storeChannel && activeStoreId) {
      storeChannel.send({
        type: 'broadcast',
        event: 'order-update',
        payload: { orderId: activeOrderId, status: result.status },
      })
    }

    // Stop movement and show banner if delivered
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
    console.error('Position update error:', err.message)
  }
}

// ─── cleanup ──────────────────────────────────────────────────────────────────

function cleanupMap() {
  window.removeEventListener('keydown', handleKeyDown)
  if (throttleTimer) { clearTimeout(throttleTimer); throttleTimer = null }
  if (deliveryMap) { deliveryMap.remove(); deliveryMap = null }
  deliveryMarker = null

  if (supabaseClient) {
    if (orderChannel) { supabaseClient.removeChannel(orderChannel); orderChannel = null }
    if (storeChannel) { supabaseClient.removeChannel(storeChannel); storeChannel = null }
    supabaseClient = null
  }

  activeOrderId = null
  activeStoreId = null
  isDelivered = false
  document.getElementById('deliveredBanner').classList.add('hidden')
}
