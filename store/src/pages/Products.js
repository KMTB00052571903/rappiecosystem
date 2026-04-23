import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/api.js'
import { ProductCard } from '../components/ProductCard.js'
import { getSession } from '../context/session.js'

export async function renderProducts() {
  const productsGrid = document.getElementById('productsGrid')
  const loading = document.getElementById('loading')
  const noData = document.getElementById('noData')

  const session = getSession()
  if (!session?.storeId) {
    productsGrid.innerHTML = '<p>No se encontró la tienda.</p>'
    return
  }

  productsGrid.innerHTML = ''
  loading.classList.remove('hidden')
  noData.classList.add('hidden')

  // Render store info + toggle
  const storeInfo = document.getElementById('storeInfo')
  if (storeInfo) {
    storeInfo.innerHTML = `
      <div class="store-info-bar">
        <span><strong>${session.storeName}</strong></span>
        <label class="toggle-label">
          <input type="checkbox" id="storeToggle" ${session.isOpen ? 'checked' : ''} />
          ${session.isOpen ? '🟢 Abierto' : '🔴 Cerrado'}
        </label>
        <button class="btn secondary btn-create-product">+ Nuevo Producto</button>
      </div>
    `
    storeInfo.querySelector('#storeToggle').addEventListener('change', async (e) => {
      const { toggleStore } = await import('../services/api.js')
      const { setSession } = await import('../context/session.js')
      try {
        const updated = await toggleStore(session.storeId, e.target.checked)
        const label = storeInfo.querySelector('.toggle-label')
        label.textContent = updated.isOpen ? '🟢 Abierto' : '🔴 Cerrado'
        label.prepend(Object.assign(document.createElement('input'), {
          type: 'checkbox', id: 'storeToggle', checked: updated.isOpen
        }))
        setSession({ ...session, isOpen: updated.isOpen })
      } catch (err) {
        alert('Error al cambiar estado: ' + err.message)
        e.target.checked = !e.target.checked
      }
    })

    storeInfo.querySelector('.btn-create-product').addEventListener('click', () => {
      showCreateProductForm(session.storeId)
    })
  }

  try {
    const products = await fetchProducts(session.storeId)
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
            await deleteProduct(product.id)
          } else {
            await updateProduct(updated)
          }
          renderProducts()
        } catch (err) {
          alert('Error: ' + err.message)
        }
      })
      productsGrid.appendChild(card)
    })
  } catch (err) {
    loading.classList.add('hidden')
    productsGrid.innerHTML = `<p class="error">Error al cargar productos: ${err.message}</p>`
  }
}

function showCreateProductForm(storeId) {
  const name = prompt('Nombre del producto:')
  if (!name) return
  const priceStr = prompt('Precio:')
  if (!priceStr) return
  const price = Number(priceStr)
  if (isNaN(price) || price <= 0) return alert('Precio inválido')

  createProduct({ name, price, storeId })
    .then(() => renderProducts())
    .catch(err => alert('Error al crear producto: ' + err.message))
}
