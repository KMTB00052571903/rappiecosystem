import { renderProducts } from '../pages/Products.js'

export function StoreCard(store) {
  const card = document.createElement('div')
  card.className = `store-card ${store.isOpen ? 'open' : 'closed'}`

  card.innerHTML = `
    <div class="store-header">
      <i class="ri-store-2-line store-icon"></i>
      <div>
        <h3 class="store-name">${store.name}</h3>
        <span class="store-status ${store.isOpen ? 'open' : 'closed'}">
          ${store.isOpen ? '● Abierto' : '○ Cerrado'}
        </span>
      </div>
    </div>
  `

  card.addEventListener('click', () => {
    document.getElementById('storesSection').classList.add('hidden')
    document.getElementById('storeProductsSection').classList.remove('hidden')
    renderProducts(store.id, store.name)
  })

  return card
}
