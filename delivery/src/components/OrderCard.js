const STATUS_BADGE = {
  'Creado':     '<span class="badge badge-created">Creado</span>',
  'En entrega': '<span class="badge badge-delivery">En entrega</span>',
  'Entregado':  '<span class="badge badge-done">Entregado</span>',
}

export function OrderCard(order, onAccept) {
  const card = document.createElement('div')
  card.className = 'order-card'

  const badge = STATUS_BADGE[order.status] || `<span class="badge">${order.status}</span>`
  const items = (order.order_items || [])
    .map(i => `${i.products?.name || 'Producto'} x${i.quantity}`)
    .join(', ')

  const canAccept = order.status === 'Creado'

  card.innerHTML = `
    <div class="order-header">
      <span class="order-id">Pedido #${order.id.slice(0, 8)}</span>
      ${badge}
    </div>
    <div class="order-details">
      <p>${items || 'Sin items'}</p>
      <p class="order-date">${order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</p>
    </div>
    ${canAccept ? '<button class="btn-accept btn primary">Aceptar Pedido</button>' : ''}
  `

  if (canAccept) {
    card.querySelector('.btn-accept').addEventListener('click', () => {
      if (onAccept) onAccept(order)
    })
  }

  return card
}
