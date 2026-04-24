import { fetchMyOrders } from '../services/api.js'
import { OrderCard } from '../components/OrderCard.js'

const SUPABASE_URL = 'https://yusnextkfjdjrjbotitk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1c25leHRrZmpkanJqYm90aXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDEyNzAsImV4cCI6MjA4OTE3NzI3MH0.GEHYjCrGQVYIKWgdRWIWu2DP83TdpnUNNIDQn8_N7b8'

let trackingMap = null
let trackingMarker = null
let trackingChannel = null

export async function renderOrders() {
  const list = document.getElementById('myOrdersList')
  list.innerHTML = '<p class="loading">Cargando pedidos...</p>'

  try {
    const orders = await fetchMyOrders()
    list.innerHTML = ''

    if (!orders || orders.length === 0) {
      list.innerHTML = '<p>No tienes pedidos aún.</p>'
      return
    }

    orders.forEach(order => {
      const card = OrderCard(order, openTrackingModal)
      list.appendChild(card)
    })
  } catch (err) {
    console.error(err)
    list.innerHTML = '<p class="error">Error al cargar pedidos</p>'
  }
}

function openTrackingModal(order) {
  const modal = document.getElementById('trackingModal')
  modal.classList.remove('hidden')

  // Parse destination from GeoJSON
  let destLat = 4.711, destLng = -74.072
  if (order.destination?.coordinates) {
    destLng = order.destination.coordinates[0]
    destLat = order.destination.coordinates[1]
  }

  // Init map centered on destination
  if (trackingMap) {
    trackingMap.remove()
    trackingMap = null
    trackingMarker = null
  }

  trackingMap = window.L.map('trackingMap').setView([destLat, destLng], 16)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(trackingMap)

  // Destination marker (consumer's location)
  window.L.marker([destLat, destLng], {
    icon: window.L.divIcon({ className: 'dest-icon', html: '📍', iconSize: [30, 30] })
  }).addTo(trackingMap).bindPopup('Tu ubicación').openPopup()

  // Delivery marker (starts at destination, updated via broadcast)
  trackingMarker = window.L.marker([destLat, destLng], {
    icon: window.L.divIcon({ className: 'delivery-icon', html: '🛵', iconSize: [30, 30] })
  }).addTo(trackingMap).bindPopup('Repartidor')

  // Subscribe to Supabase Broadcast
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  if (trackingChannel) supabase.removeChannel(trackingChannel)

  trackingChannel = supabase.channel(`order:${order.id}`)
  trackingChannel
    .on('broadcast', { event: 'position-update' }, ({ payload }) => {
      const { lat, lng, status } = payload
      trackingMarker.setLatLng([lat, lng])
      trackingMap.panTo([lat, lng])

      if (status === 'Entregado') {
        showDeliveredToast()
        supabase.removeChannel(trackingChannel)
        trackingChannel = null
        // Refresh order list
        renderOrders()
      }
    })
    .subscribe()

  document.getElementById('closeTrackingBtn').onclick = () => {
    if (trackingMap) { trackingMap.remove(); trackingMap = null }
    if (trackingChannel) { supabase.removeChannel(trackingChannel); trackingChannel = null }
    modal.classList.add('hidden')
  }
}

function showDeliveredToast() {
  const toast = document.getElementById('deliveredToast')
  if (!toast) return
  toast.classList.remove('hidden')
  setTimeout(() => toast.classList.add('hidden'), 4000)
}
