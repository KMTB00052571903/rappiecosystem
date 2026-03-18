export function ProductCard(product, onUpdate) {
  const card = document.createElement('div')
  card.className = 'card-item'

  card.innerHTML = `
    <h3>${product.name || 'Producto'}</h3>
    <p><strong>Precio:</strong> $${product.price || 0}</p>
    <p><strong>Stock:</strong> ${product.stock ?? 0}</p>

    <div class="actions">
      <button class="btn primary">Editar</button>
      <button class="btn secondary">Eliminar</button>
    </div>
  `

  const editBtn = card.querySelector('.btn.primary')
  const deleteBtn = card.querySelector('.btn.secondary')

  // =========================
  // ✏️ EDITAR PRODUCTO
  // =========================
  editBtn.addEventListener('click', () => {
    const nuevoNombre = prompt('Nuevo nombre:', product.name)
    const nuevoPrecio = prompt('Nuevo precio:', product.price)
    const nuevoStock = prompt('Nuevo stock:', product.stock)

    if (!nuevoNombre || !nuevoPrecio || !nuevoStock) return

    const updatedProduct = {
      ...product,
      name: nuevoNombre,
      price: Number(nuevoPrecio),
      stock: Number(nuevoStock),
    }

    if (onUpdate) onUpdate(updatedProduct)
  })

  // =========================
  // 🗑 ELIMINAR PRODUCTO
  // =========================
  deleteBtn.addEventListener('click', () => {
    if (!confirm(`¿Eliminar producto "${product.name}"?`)) return

    if (onUpdate) {
      onUpdate({ ...product, deleted: true })
    }
  })

  return card
}