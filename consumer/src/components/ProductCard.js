import { addToCart, getCart } from '../context/session.js'

export function ProductCard(product, onCartUpdated) {
  const card = document.createElement('div')
  card.className = 'product-card'

  const inCart = getCart().filter(p => p.id === product.id).length

  const imgSrc = product.image || 'https://via.placeholder.com/120'

  card.innerHTML = `
    <img
      src="${imgSrc}"
      class="product-image"
      loading="lazy"
      onerror="this.src='https://via.placeholder.com/120'"
      alt="${product.name}"
    >
    <div class="product-content">
      <h4 class="product-name">${product.name}</h4>
      <div class="product-footer">
        <span class="product-price">$${product.price.toLocaleString()}</span>
        <button class="btn-add-to-cart">+ Agregar</button>
      </div>
      ${inCart > 0 ? `<span class="in-cart-badge">En carrito: ${inCart}</span>` : ''}
    </div>
  `

  card.querySelector('.btn-add-to-cart').addEventListener('click', () => {
    addToCart(product)
    if (onCartUpdated) onCartUpdated()
  })

  return card
}
