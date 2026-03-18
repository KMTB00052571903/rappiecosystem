import { fetchProducts } from '../services/api.js'
import { ProductCard } from '../components/ProductCard.js'

export async function renderProducts(storeId, storeName) {
  const productsList = document.getElementById('productsList')
  const storeNameEl = document.getElementById('storeName')

  storeNameEl.textContent = `Productos de ${storeName}`
  productsList.innerHTML = '<p>Cargando productos...</p>'

  try {
    const products = await fetchProducts()

    productsList.innerHTML = ''

    products.forEach(product => {
      productsList.appendChild(ProductCard(product))
    })
  } catch (err) {
    productsList.innerHTML = '<p>Error al cargar productos</p>'
  }
}