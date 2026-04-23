import { loginUser, registerUser } from './src/services/api.js'
import { setSession, clearSession, getSession } from './src/context/session.js'
import { renderOrders } from './src/pages/Orders.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection')
  const mainSection = document.getElementById('mainSection')
  const userName = document.getElementById('userName')
  const logoutBtn = document.getElementById('logoutBtn')

  const existingUser = getSession()
  if (existingUser) {
    showMain(existingUser)
    renderOrders('pending')
  }

  // LOGIN
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    try {
      const data = await loginUser(email, password)
      if (data?.user) {
        setSession(data.user)
        showMain(data.user)
        renderOrders('pending')
      } else {
        alert('Error al iniciar sesión')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  })

  // REGISTER (role always delivery)
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    try {
      await registerUser({ email, password })
      // Auto login after register
      const data = await loginUser(email, password)
      if (data?.user) {
        setSession(data.user)
        showMain(data.user)
        renderOrders('pending')
      }
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
  document.getElementById('pendingTab').addEventListener('click', () => {
    setActiveTab(document.getElementById('pendingTab'), document.getElementById('acceptedTab'))
    renderOrders('pending')
  })

  document.getElementById('acceptedTab').addEventListener('click', () => {
    setActiveTab(document.getElementById('acceptedTab'), document.getElementById('pendingTab'))
    renderOrders('accepted')
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

  function showMain(user) {
    loginSection.classList.add('hidden')
    mainSection.classList.remove('hidden')
    logoutBtn.classList.remove('hidden')
    userName.textContent = user.email || user.user_metadata?.email || 'Repartidor'
  }
})

function setActiveTab(active, inactive) {
  active.classList.add('active')
  inactive.classList.remove('active')
}
