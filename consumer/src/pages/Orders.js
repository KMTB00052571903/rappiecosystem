import { fetchOrders } from '../services/api.js'
import { OrderCard } from '../components/OrderCard.js'

export async function renderOrders() {
  const ordersList = document.getElementById('myOrdersList')
  ordersList.innerHTML = '<p>Cargando pedidos...</p>'

  try {
    const orders = await fetchOrders()

    ordersList.innerHTML = ''

    orders.forEach(order => {
      ordersList.appendChild(OrderCard(order))
    })
  } catch (err) {
    ordersList.innerHTML = '<p>Error al cargar pedidos</p>'
  }
}