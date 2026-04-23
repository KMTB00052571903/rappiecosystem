const STATUS_LABELS = {
  'Creado': { label: 'Creado', cls: 'badge-created' },
  'En entrega': { label: 'En entrega', cls: 'badge-delivery' },
  'Entregado': { label: 'Entregado', cls: 'badge-done' },
}

export function OrderCard(order, onTrack) {
  const card = document.createElement('div')
  card.className = 'order-card'
  card.dataset.orderId = order.id

  const badge = STATUS_LABELS[order.status] || { label: order.status, cls: 'badge-created' }

  const items = (order.order_items || [])
    .map(i => `<span>${i.products?.name || 'Producto'} x${i.quantity}</span>`)
    .join(', ')

  const showTrack = order.status === 'En entrega'

  card.innerHTML = `
    <div class="order-header">
      <span class="order-id">Pedido #${order.id.slice(0, 8)}</span>
      <span class="badge ${badge.cls}">${badge.label}</span>
    </div>
    <div class="order-details">
      <p>${items || 'Sin productos'}</p>
      <p class="order-date">${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</p>
    </div>
    ${showTrack ? '<button class="btn-track">Ver en mapa</button>' : ''}
    ${order.status === 'Entregado' ? '<p class="delivered-msg">¡Tu pedido fue entregado!</p>' : ''}
  `

  if (showTrack) {
    card.querySelector('.btn-track').addEventListener('click', () => {
      if (onTrack) onTrack(order)
    })
  }

  return card
}
