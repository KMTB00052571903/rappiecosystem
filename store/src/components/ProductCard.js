export function ProductCard(product, onUpdate) {
  const card = document.createElement('div')
  card.className = 'card-item'

  card.innerHTML = `
    <h3>${product.name}</h3>
    <p><strong>Precio:</strong> $${product.price.toLocaleString()}</p>
    <div class="actions">
      <button class="btn primary btn-edit">Editar</button>
      <button class="btn secondary btn-delete">Eliminar</button>
    </div>
  `

  card.querySelector('.btn-edit').addEventListener('click', () => {
    const nuevoNombre = prompt('Nuevo nombre:', product.name)
    const nuevoPrecio = prompt('Nuevo precio:', product.price)
    if (!nuevoNombre || !nuevoPrecio) return
    const price = Number(nuevoPrecio)
    if (isNaN(price)) return alert('Precio inválido')
    if (onUpdate) onUpdate({ ...product, name: nuevoNombre, price })
  })

  card.querySelector('.btn-delete').addEventListener('click', () => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return
    if (onUpdate) onUpdate({ ...product, deleted: true })
  })

  return card
}
