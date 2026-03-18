import { loginUser, registerUser } from './services/api.js'
import { renderStores } from './pages/Stores.js'
import { renderOrders } from './pages/Orders.js'
import { clearSession, setSession, getSession } from './context/session.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection')
  const mainSection = document.getElementById('mainSection')
  const userDisplay = document.getElementById('userDisplay')
  const logoutBtn = document.getElementById('logoutBtn')

  // =========================
  // 🔁 AUTO LOGIN
  // =========================
  const existingUser = getSession()

  if (existingUser) {
    loginSection.classList.add('hidden')
    mainSection.classList.remove('hidden')
    logoutBtn.classList.remove('hidden')

    userDisplay.textContent = existingUser.email
    renderStores()
  }

  // =========================
  // 🔐 LOGIN
  // =========================
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    const data = await loginUser(email, password)

    if (data && data.user) {
      setSession(data.user)

      loginSection.classList.add('hidden')
      mainSection.classList.remove('hidden')
      logoutBtn.classList.remove('hidden')

      userDisplay.textContent = data.user.email

      renderStores()
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

    // 🔥 rol fijo
    const role = "user"

    const data = await registerUser({ email, password, role })

    if (data && data.user) {
      setSession(data.user)

      loginSection.classList.add('hidden')
      mainSection.classList.remove('hidden')
      logoutBtn.classList.remove('hidden')

      userDisplay.textContent = data.user.email

      renderStores()
    } else {
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
  // 📂 TABS APP
  // =========================
  document.getElementById('storesTab').addEventListener('click', () => {
    renderStores()
    toggleTab('storesSection')
  })

  document.getElementById('ordersTab').addEventListener('click', () => {
    renderOrders()
    toggleTab('myOrdersSection')
  })

  // =========================
  // 🔁 TABS LOGIN / REGISTER
  // =========================
  const authTabs = document.querySelectorAll('.tabs .tab')
  const forms = document.querySelectorAll('.form')

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'))
      forms.forEach(f => f.classList.remove('active'))

      tab.classList.add('active')

      const target = tab.dataset.tab
      document.getElementById(target + 'Form').classList.add('active')
    })
  })
})

// =========================
// 🔁 CAMBIO DE VISTA
// =========================
function toggleTab(sectionId) {
  document.querySelectorAll('.content').forEach(sec => sec.classList.add('hidden'))
  document.getElementById(sectionId).classList.remove('hidden')

  document.querySelectorAll('#storesTab, #ordersTab').forEach(tab => tab.classList.remove('active'))

  if (sectionId === 'storesSection') {
    document.getElementById('storesTab').classList.add('active')
  }

  if (sectionId === 'myOrdersSection') {
    document.getElementById('ordersTab').classList.add('active')
  }
}