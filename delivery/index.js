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
  const loginForm = document.getElementById('loginForm')

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value

    try {
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
    } catch (error) {
      console.error(error)
      alert('Error en login (backend caído seguramente 😅)')
    }
  })

  // =========================
  // 📝 REGISTER
  // =========================
  const registerForm = document.getElementById('registerForm')

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value

    // 🔥 FIX: rol fijo (ya no existe en HTML)
    const role = "repartidor"

    try {
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
    } catch (error) {
      console.error(error)
      alert('Error en registro (backend caído seguramente 😅)')
    }
  })

  // =========================
  // 🚪 LOGOUT
  // =========================
  const logoutBtn = document.getElementById('logoutBtn')

  logoutBtn.addEventListener('click', () => {
    clearSession()

    mainSection.classList.add('hidden')
    loginSection.classList.remove('hidden')
  })

  // =========================
  // 📂 TABS (PEDIDOS)
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

  // =========================
  // 🔁 TABS (LOGIN / REGISTER)
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

// =========================
// 🔁 UI TABS
// =========================
function setActiveTab(active, inactive) {
  active.classList.add('active')
  inactive.classList.remove('active')
}