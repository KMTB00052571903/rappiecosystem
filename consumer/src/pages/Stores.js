import { fetchStores } from '../services/api.js'
import { StoreCard } from '../components/StoreCard.js'

export async function renderStores() {
  const storesList = document.getElementById('storesList')
  storesList.innerHTML = '<p class="loading">Cargando restaurantes...</p>'

  try {
    const stores = await fetchStores()
    storesList.innerHTML = ''

    if (!stores || stores.length === 0) {
      storesList.innerHTML = '<p>No hay restaurantes disponibles.</p>'
      return
    }

    stores.forEach(store => storesList.appendChild(StoreCard(store)))
  } catch (err) {
    console.error(err)
    storesList.innerHTML = '<p class="error">Error al cargar restaurantes</p>'
  }
}
