import { fetchProducts } from '../services/api.js'
import { ProductCard } from '../components/ProductCard.js'
import { getCart, getCartStoreId, clearCart } from '../context/session.js'

let currentStoreId = null

export async function renderProducts(storeId, storeName) {
  currentStoreId = storeId
  const productsList = document.getElementById('productsList')
  const storeNameEl = document.getElementById('storeName')

  storeNameEl.textContent = storeName
  productsList.innerHTML = '<p class="loading">Cargando productos...</p>'

  document.getElementById('backToStores').addEventListener('click', () => {
    document.getElementById('storeProductsSection').classList.add('hidden')
    document.getElementById('storesSection').classList.remove('hidden')
  }, { once: true })

  try {
    const products = await fetchProducts(storeId)
    productsList.innerHTML = ''

    if (!products || products.length === 0) {
      productsList.innerHTML = '<p>Sin productos en esta tienda.</p>'
    } else {
      products.forEach(product => {
        const card = ProductCard(product, renderCart)
        productsList.appendChild(card)
      })
    }

    renderCart()
  } catch (err) {
    console.error(err)
    productsList.innerHTML = '<p class="error">Error al cargar productos</p>'
  }
}

function renderCart() {
  const container = document.getElementById('carritoContainer')
  const cart = getCart()

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">El carrito está vacío</p>'
    return
  }

  const total = cart.reduce((sum, p) => sum + p.price, 0)
  const itemsHtml = cart.map(p => `<div class="cart-item"><span>${p.name}</span><span>$${p.price.toLocaleString()}</span></div>`).join('')

  container.innerHTML = `
    <div class="cart-items">${itemsHtml}</div>
    <div class="cart-total"><strong>Total: $${total.toLocaleString()}</strong></div>
    <button id="clearCartBtn" class="btn secondary">Vaciar</button>
    <button id="checkoutBtn" class="btn primary">Crear Pedido</button>
  `

  container.querySelector('#clearCartBtn').addEventListener('click', () => {
    clearCart()
    renderCart()
  })

  container.querySelector('#checkoutBtn').addEventListener('click', () => {
    openOrderMapModal(currentStoreId, cart)
  })
}

function openOrderMapModal(storeId, cart) {
  const modal = document.getElementById('orderMapModal')
  modal.classList.remove('hidden')

  let selectedLat = null
  let selectedLng = null

  // Init Leaflet map centered on Bogotá
  const map = window.L.map('orderMap').setView([4.711, -74.072], 13)
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  let marker = null

  map.on('click', (e) => {
    selectedLat = e.latlng.lat
    selectedLng = e.latlng.lng

    if (marker) marker.remove()
    marker = window.L.marker([selectedLat, selectedLng]).addTo(map)
      .bindPopup('Punto de entrega').openPopup()

    document.getElementById('confirmOrderBtn').disabled = false
    document.getElementById('selectedLocationText').textContent =
      `Lat: ${selectedLat.toFixed(5)}, Lng: ${selectedLng.toFixed(5)}`
  })

  document.getElementById('cancelOrderBtn').onclick = () => {
    map.remove()
    modal.classList.add('hidden')
  }

  document.getElementById('confirmOrderBtn').onclick = async () => {
    if (!selectedLat || !selectedLng) return
    await submitOrder(storeId, cart, selectedLat, selectedLng)
    map.remove()
    modal.classList.add('hidden')
  }
}

async function submitOrder(storeId, cart, lat, lng) {
  const { createOrder, fetchMyOrders } = await import('../services/api.js')
  const items = cart.map(p => ({ productId: p.id, quantity: 1 }))

  try {
    await createOrder({ storeId, items, destinationLat: lat, destinationLng: lng })
    clearCart()
    renderCart()

    // Navigate to orders tab
    document.querySelectorAll('.content').forEach(s => s.classList.add('hidden'))
    document.getElementById('myOrdersSection').classList.remove('hidden')
    document.querySelectorAll('#storesTab, #ordersTab').forEach(t => t.classList.remove('active'))
    document.getElementById('ordersTab').classList.add('active')

    const { renderOrders } = await import('./Orders.js')
    renderOrders()

    alert('¡Pedido creado exitosamente!')
  } catch (err) {
    console.error(err)
    alert('Error al crear pedido: ' + err.message)
  }
}
