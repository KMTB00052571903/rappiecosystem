export function OrderCard(order, onUpdate) {
  const card = document.createElement('div')
  card.className = 'card-item'

  const estado = order.estado || 'pendiente'

  card.innerHTML = `
    <h3>Pedido #${order.id}</h3>
    <p><strong>Cliente:</strong> ${order.customerName || 'N/A'}</p>
    <p><strong>Total:</strong> $${order.total || 0}</p>
    <p class="order-status"><strong>Estado:</strong> ${estado}</p>

    <div class="actions">
      <button class="btn primary" ${estado === 'preparado' ? 'disabled' : ''}>
        Marcar como preparado
      </button>
    </div>
  `

  const btn = card.querySelector('.btn.primary')
  const statusEl = card.querySelector('.order-status')

  btn.addEventListener('click', async () => {
    // 🔥 futuro: conectar con backend
    if (onUpdate) {
      await onUpdate({ ...order, estado: 'preparado' })
    }

    alert(`Pedido #${order.id} marcado como preparado`)

    statusEl.innerHTML = `<strong>Estado:</strong> preparado`
    btn.disabled = true
  })

  return card
}