export function OrderCard(order) {
  const card = document.createElement('div')
  card.className = `order-card ${order.status || 'pending'}`

  card.innerHTML = `
    <div class="order-header">
      <span class="order-id">Pedido #${order.id}</span>
      <span class="order-status">${order.status || 'pending'}</span>
    </div>
    <div class="order-details">
      <p><strong>Total:</strong> $${order.total || 0}</p>
      <p><strong>Fecha:</strong> ${
        order.createdAt ? new Date(order.createdAt).toLocaleString() : ''
      }</p>
    </div>
  `

  return card
}