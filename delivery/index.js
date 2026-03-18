import { loginUser, registerUser } from './src/services/api.js'
import { setSession, clearSession, getSession } from './src/context/session.js'
import { renderOrders } from './src/pages/Orders.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection')
  const mainSection = document.getElementById('mainSection')
  const userName = document.getElementById('userName')

  // =========================
  // 🔁 AUTO LOGIN
  // =========================
  const existingUser = getSession()

  if (existingUser) {
    loginSection.classList.add('hidden')
    mainSection.classList.remove('hidden')
    userName.textContent = existingUser.email || 'Repartidor'
    renderOrders('pendiente')
  }

  // =========================
  // 🔐 LOGIN
  // =========================
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    const user = await loginUser(email, password)

    if (user) {
      setSession(user)

      loginSection.classList.add('hidden')
      mainSection.classList.remove('hidden')

      userName.textContent = user.email

      renderOrders('pendiente')
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

    if (data) {
      setSession(data)

      loginSection.classList.add('hidden')
      mainSection.classList.remove('hidden')

      userName.textContent = data.email

      renderOrders('pendiente')
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
  const pendingTab = document.getElementById('pendingTab')
  const acceptedTab = document.getElementById('acceptedTab')

  pendingTab.addEventListener('click', () => {
    setActiveTab(pendingTab, acceptedTab)
    renderOrders('pendiente')
  })

  acceptedTab.addEventListener('click', () => {
    setActiveTab(acceptedTab, pendingTab)
    renderOrders('aceptado')
  })
})

// =========================
// 🔁 UI TABS
// =========================
function setActiveTab(active, inactive) {
  active.classList.add('active')
  inactive.classList.remove('active')
}