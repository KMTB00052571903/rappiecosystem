import { fetchProducts, updateProduct, deleteProduct } from '../services/api.js'
import { ProductCard } from '../components/ProductCard.js'
import { getSession } from '../context/session.js'

export async function renderProducts() {
  const productsGrid = document.getElementById('productsGrid')
  const loading = document.getElementById('loading')
  const noData = document.getElementById('noData')

  // =========================
  // 🔒 VALIDAR SESIÓN
  // =========================
  const store = getSession()

  if (!store) {
    productsGrid.innerHTML = '<p class="error-message">Debes iniciar sesión</p>'
    return
  }

  // =========================
  // 🔄 LOADING
  // =========================
  productsGrid.innerHTML = ''
  loading.classList.remove('hidden')
  noData.classList.add('hidden')

  try {
    // ⚠️ backend actual NO filtra por store → fallback
    const products = await fetchProducts?.() || []

    loading.classList.add('hidden')
    productsGrid.innerHTML = ''

    if (!products || products.length === 0) {
      noData.classList.remove('hidden')
      return
    }

    products.forEach(product => {
      const card = ProductCard(product, async (updated) => {
        try {
          if (updated.deleted) {
            if (deleteProduct) {
              await deleteProduct(product.id)
            } else {
              console.log('Eliminar producto (mock):', product.id)
            }
          } else {
            if (updateProduct) {
              await updateProduct(updated)
            } else {
              console.log('Actualizar producto (mock):', updated)
            }
          }

          // 🔄 refrescar lista
          renderProducts()

        } catch (err) {
          console.error('Error actualizando producto:', err)
          alert('Error al actualizar producto')
        }
      })

      productsGrid.appendChild(card)
    })

  } catch (err) {
    console.error(err)

    loading.classList.add('hidden')
    productsGrid.innerHTML = `
      <p class="error-message">
        Error al cargar productos 😢
      </p>
    `
  }
}