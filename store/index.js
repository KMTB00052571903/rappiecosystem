import { loginStore, registerStore, fetchMyStore } from './src/services/api.js'
import { setSession, clearSession, getSession } from './src/context/session.js'
import { renderProducts } from './src/pages/Products.js'
import { renderOrders } from './src/pages/Orders.js'

document.addEventListener('DOMContentLoaded', async () => {
  const loginSection = document.getElementById('loginSection')
  const mainSection = document.getElementById('mainSection')
  const storeDisplayName = document.getElementById('storeDisplayName')
  const logoutBtn = document.getElementById('logoutBtn')
  const productsTab = document.getElementById('productsTab')
  const ordersTab = document.getElementById('ordersTab')
  const productsGrid = document.getElementById('productsGrid')
  const ordersGrid = document.getElementById('ordersGrid')

  const existingSession = getSession()
  if (existingSession) {
    showMain(existingSession)
    renderProducts()
  }

  // LOGIN
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    try {
      await loginStore(email, password)
      const store = await fetchMyStore()
      const session = buildSession(store)
      setSession(session)
      showMain(session)
      renderProducts()
    } catch (err) {
      alert('Error al iniciar sesión: ' + err.message)
    }
  })

  // REGISTER
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const storeName = document.getElementById('registerStoreName').value
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    try {
      await registerStore({ email, password, storeName })
      // Auto login after register
      await loginStore(email, password)
      const store = await fetchMyStore()
      const session = buildSession(store)
      setSession(session)
      showMain(session)
      renderProducts()
    } catch (err) {
      alert('Error en registro: ' + err.message)
    }
  })

  // LOGOUT
  logoutBtn.addEventListener('click', () => {
    clearSession()
    mainSection.classList.add('hidden')
    loginSection.classList.remove('hidden')
    logoutBtn.classList.add('hidden')
  })

  // TABS
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

  // Auth tabs
  document.querySelectorAll('.tabs .tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tabs .tab[data-tab]').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.form').forEach(f => f.classList.remove('active'))
      tab.classList.add('active')
      const form = document.getElementById(tab.dataset.tab + 'Form')
      if (form) form.classList.add('active')
    })
  })

  function showMain(session) {
    loginSection.classList.add('hidden')
    mainSection.classList.remove('hidden')
    logoutBtn.classList.remove('hidden')
    storeDisplayName.textContent = session.storeName || session.email || 'Tienda'
  }

  function buildSession(store) {
    return {
      storeId: store.id,
      storeName: store.name,
      isOpen: store.isOpen,
      userId: store.userId,
    }
  }
})

function setActiveTab(active, inactive) {
  active.classList.add('active')
  inactive.classList.remove('active')
}
