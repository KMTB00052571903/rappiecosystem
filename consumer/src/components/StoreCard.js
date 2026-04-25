import { renderProducts } from '../pages/Products.js'

export function StoreCard(store) {
  // Supabase can return the column as isOpen (camelCase, expected) or is_open
  // (snake_case, defensive fallback). Normalise once so all usages below are safe.
  const isOpen = store.isOpen ?? store.is_open ?? false

  const card = document.createElement('div')
  card.className = `store-card ${isOpen ? 'open' : 'closed'}`

  const imgSrc = store.image || 'https://via.placeholder.com/80'

  card.innerHTML = `
    <img
      src="${imgSrc}"
      class="store-logo"
      loading="lazy"
      onerror="this.src='https://via.placeholder.com/80'"
      alt="${store.name}"
    >
    <h3 class="store-name">${store.name}</h3>
    <span class="store-status ${isOpen ? 'open' : 'closed'}">
      ${isOpen ? '● Abierto' : '○ Cerrado'}
    </span>
  `

  card.addEventListener('click', () => {
    document.getElementById('storesSection').classList.add('hidden')
    document.getElementById('storeProductsSection').classList.remove('hidden')
    renderProducts(store.id, store.name)
  })

  return card
}
