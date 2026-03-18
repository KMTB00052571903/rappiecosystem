import { loginStore, registerStore } from './src/services/api.js'
import { setSession, clearSession, getSession } from './src/context/session.js'
import { renderProducts } from './src/pages/Products.js'
import { renderOrders } from './src/pages/Orders.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection')
  const mainSection = document.getElementById('mainSection')
  const storeName = document.getElementById('storeName')
  const logoutBtn = document.getElementById('logoutBtn')

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
    logoutBtn.classList.remove('hidden')

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

    try {
      const store = await loginStore(email, password)

      if (store) {
        setSession(store)

        loginSection.classList.add('hidden')
        mainSection.classList.remove('hidden')
        logoutBtn.classList.remove('hidden')

        storeName.textContent = store.email

        renderProducts()
      } else {
        alert('Error al iniciar sesión')
      }
    } catch (error) {
      console.error(error)
      alert('Error en login')
    }
  })

  // =========================
  // 📝 REGISTER
  // =========================
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value

    const role = "store"

    try {
      const store = await registerStore({ email, password, role })

      if (store) {
        setSession(store)

        loginSection.classList.add('hidden')
        mainSection.classList.remove('hidden')
        logoutBtn.classList.remove('hidden')

        storeName.textContent = store.email

        renderProducts()
      } else {
        alert('Error en registro')
      }
    } catch (error) {
      console.error(error)
      alert('Error en registro')
    }
  })

  // =========================
  // 🚪 LOGOUT
  // =========================
  logoutBtn.addEventListener('click', () => {
    clearSession()

    mainSection.classList.add('hidden')
    loginSection.classList.remove('hidden')
    logoutBtn.classList.add('hidden')
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

  // =========================
  // 🔁 LOGIN / REGISTER TABS
  // =========================
  const authTabs = document.querySelectorAll('.tabs .tab')
  const forms = document.querySelectorAll('.form')

  authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      authTabs.forEach((t) => t.classList.remove('active'))
      forms.forEach((f) => f.classList.remove('active'))

      tab.classList.add('active')

      const target = tab.dataset.tab
      const form = document.getElementById(target + 'Form')

      if (form) form.classList.add('active')
    })
  })
})

function setActiveTab(active, inactive) {
  active.classList.add('active')
  inactive.classList.remove('active')
}