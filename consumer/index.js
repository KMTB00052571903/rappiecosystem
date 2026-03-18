import { loginUser, registerUser } from './services/api.js'
import { renderStores } from './pages/Stores.js'
import { renderOrders } from './pages/Orders.js'
import { clearSession, setSession, getSession } from './context/session.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection')
  const mainSection = document.getElementById('mainSection')
  const userDisplay = document.getElementById('userDisplay')

  // =========================
  // 🔁 AUTO LOGIN (persistencia)
  // =========================
  const existingUser = getSession()

  if (existingUser) {
    loginSection.classList.add('hidden')
    mainSection.classList.remove('hidden')
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
    const role = document.getElementById('registerRole').value

    const data = await registerUser({ email, password, role })

    if (data && data.user) {
      setSession(data.user)

      loginSection.classList.add('hidden')
      mainSection.classList.remove('hidden')

      userDisplay.textContent = data.user.email

      renderStores()
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
  document.getElementById('storesTab').addEventListener('click', () => {
    renderStores()
    toggleTab('storesSection')
  })

  document.getElementById('ordersTab').addEventListener('click', () => {
    renderOrders()
    toggleTab('myOrdersSection')
  })
})

// =========================
// 🔁 CAMBIO DE VISTA
// =========================
function toggleTab(sectionId) {
  document.querySelectorAll('.content').forEach(sec => sec.classList.add('hidden'))
  document.getElementById(sectionId).classList.remove('hidden')

  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'))

  if (sectionId === 'storesSection') {
    document.getElementById('storesTab').classList.add('active')
  }

  if (sectionId === 'myOrdersSection') {
    document.getElementById('ordersTab').classList.add('active')
  }
}