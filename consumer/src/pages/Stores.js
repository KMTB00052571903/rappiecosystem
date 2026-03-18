import { fetchStores } from '../services/api.js'
import { StoreCard } from '../components/StoreCard.js'

export async function renderStores() {
  const storesList = document.getElementById('storesList')
  storesList.innerHTML = '<p>Cargando tiendas...</p>'

  try {
    const stores = await fetchStores()

    storesList.innerHTML = ''

    stores.forEach(store => {
      storesList.appendChild(StoreCard(store))
    })
  } catch (err) {
    storesList.innerHTML = '<p>Error al cargar tiendas</p>'
  }
}