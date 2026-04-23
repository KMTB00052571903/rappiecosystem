import { loginUser, registerUser } from './src/services/api.js'
import { renderStores } from './src/pages/Stores.js'
import { renderOrders } from './src/pages/Orders.js'
import { clearSession, setSession, getSession } from './src/context/session.js'

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection')
  const mainSection = document.getElementById('mainSection')
  const userDisplay = document.getElementById('userDisplay')
  const logoutBtn = document.getElementById('logoutBtn')

  const existingUser = getSession()
  if (existingUser) {
    showMain(existingUser)
    renderStores()
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
        renderStores()
      } else {
        alert('Error al iniciar sesión')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  })

  // REGISTER (role always consumer)
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = document.getElementById('registerName').value
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    try {
      const data = await registerUser({ email, password, role: 'consumer', name })
      if (data?.user) {
        // After register, log in to get session token
        const loginData = await loginUser(email, password)
        if (loginData?.user) {
          setSession(loginData.user)
          showMain(loginData.user)
          renderStores()
        }
      } else {
        alert('Registro exitoso. Inicia sesión.')
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
  document.getElementById('storesTab').addEventListener('click', () => {
    renderStores()
    toggleContent('storesSection')
    setActiveNavTab('storesTab')
  })

  document.getElementById('ordersTab').addEventListener('click', () => {
    renderOrders()
    toggleContent('myOrdersSection')
    setActiveNavTab('ordersTab')
  })

  document.getElementById('refreshStoresBtn').addEventListener('click', renderStores)
  document.getElementById('refreshOrdersBtn').addEventListener('click', renderOrders)

  // Auth tabs (login / register)
  document.querySelectorAll('.tabs .tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tabs .tab[data-tab]').forEach(t => t.classList.remove('active'))
      document.querySelectorAll('.form').forEach(f => f.classList.remove('active'))
      tab.classList.add('active')
      document.getElementById(tab.dataset.tab + 'Form').classList.add('active')
    })
  })

  function showMain(user) {
    loginSection.classList.add('hidden')
    mainSection.classList.remove('hidden')
    logoutBtn.classList.remove('hidden')
    userDisplay.textContent = user.email || user.user_metadata?.name || 'Usuario'
  }
})

function toggleContent(sectionId) {
  document.querySelectorAll('.content').forEach(s => s.classList.add('hidden'))
  document.getElementById(sectionId).classList.remove('hidden')
}

function setActiveNavTab(tabId) {
  document.querySelectorAll('#storesTab, #ordersTab').forEach(t => t.classList.remove('active'))
  document.getElementById(tabId).classList.add('active')
}
