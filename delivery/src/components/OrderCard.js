import { acceptOrder } from '../services/api.js'

export function OrderCard(order) {
  const card = document.createElement('div')
  card.className = `order-card ${order.estado || 'pendiente'}`

  const productsHTML = (order.products || [])
    .map(p => `
      <div class="product-item">
        <span class="product-name">${p.name}</span>
        <span class="product-quantity">x${p.quantity}</span>
      </div>
    `)
    .join('')

  card.innerHTML = `
    <div class="order-header">
      <span class="order-id">Pedido #${order.id}</span>
      <span class="order-status ${order.estado || 'pendiente'}">
        ${order.estado || 'pendiente'}
      </span>
    </div>

    <div class="order-details">

      <div class="order-store">
        <i class="ri-store-2-line store-icon"></i>
        <span class="store-name">${order.storeName || 'Tienda'}</span>
      </div>

      <div class="order-customer">
        <h4>Cliente</h4>
        <div class="customer-info">
          <div><i class="ri-user-line"></i> ${order.customerName || 'N/A'}</div>
          <div><i class="ri-phone-line"></i> ${order.customerPhone || 'N/A'}</div>
          <div><i class="ri-map-pin-line"></i> ${order.customerAddress || 'N/A'}</div>
        </div>
      </div>

      <div class="order-products">
        <h4>Productos</h4>
        ${productsHTML || '<p>Sin productos</p>'}
      </div>

      <div class="order-meta">
        <span class="order-total">Total: $${order.total || 0}</span>
        <span class="order-time">
          ${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
        </span>
      </div>
    </div>

    <div class="order-actions">
      <button class="btn-accept" ${order.estado === 'aceptado' ? 'disabled' : ''}>
        Aceptar
      </button>
      <button class="btn-view-details">Ver Detalles</button>
    </div>
  `

  // =========================
  // ✅ ACEPTAR PEDIDO
  // =========================
  card.querySelector('.btn-accept').addEventListener('click', async () => {
    await acceptOrder(order.id)

    alert(`Pedido #${order.id} aceptado`)

    const statusEl = card.querySelector('.order-status')
    statusEl.textContent = 'aceptado'
    statusEl.classList.remove('pendiente')
    statusEl.classList.add('aceptado')

    card.querySelector('.btn-accept').disabled = true
  })

  // =========================
  // 👁 VER DETALLES
  // =========================
  card.querySelector('.btn-view-details').addEventListener('click', () => {
    alert(`Pedido #${order.id}\nCliente: ${order.customerName}\nTotal: $${order.total}`)
  })

  return card
}