import { loginStore, registerStore } from './src/services/api.js'
import { setSession, clearSession, getSession } from './src/context/session.js'
import { renderProducts } from './src/pages/Products.js'
import { renderOrders } from './src/pages/Orders.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection')
  const mainSection = document.getElementById('mainSection')
  const storeName = document.getElementById('storeName')

  const productsTab = document.getElementById('productsTab')
  const ordersTab = document.getElementById('ordersTab')
  const productsGrid = document.getElementById('productsGrid')
  const ordersGrid = document.getElementById('ordersGrid')

  // =========================
  // 🔁 AUTO LOGIN
  // =========================
  const existingStore = getSession()

  if (existingStore) {
    loginSection.classList.add('hidden')
    mainSection.classList.remove('hidden')
    storeName.textContent = existingStore.email || 'Tienda'
    renderProducts()
  }

  // =========================
  // 🔐 LOGIN
  // =========================
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    const store = await loginStore(email, password)

    if (store) {
      setSession(store)

      loginSection.classList.add('hidden')
      mainSection.classList.remove('hidden')

      storeName.textContent = store.email

      renderProducts()
    } else {
      alert('Error al iniciar sesión')
    }
  })

  // =========================
  // 📝 REGISTER
  // =========================
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    const role = document.getElementById('registerRole').value

    const store = await registerStore({ email, password, role })

    if (store) {
      setSession(store)

      loginSection.classList.add('hidden')
      mainSection.classList.remove('hidden')

      storeName.textContent = store.email

      renderProducts()
    } else {
      alert('Error en registro')
    }
  })

  // =========================
  // 🚪 LOGOUT
  // =========================
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession()

    mainSection.classList.add('hidden')
    loginSection.classList.remove('hidden')
  })

  // =========================
  // 📂 TABS
  // =========================
  productsTab.addEventListener('click', () => {
    setActiveTab(productsTab, ordersTab)

    productsGrid.classList.remove('hidden')
    ordersGrid.classList.add('hidden')

    renderProducts()
  })

  ordersTab.addEventListener('click', () => {
    setActiveTab(ordersTab, productsTab)

    ordersGrid.classList.remove('hidden')
    productsGrid.classList.add('hidden')

    renderOrders()
  })
})

// =========================
// 🔁 UI TABS
// =========================
function setActiveTab(active, inactive) {
  active.classList.add('active')
  inactive.classList.remove('active')
}