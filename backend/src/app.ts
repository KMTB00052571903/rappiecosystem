import express from 'express'
import cors from 'cors'

import { PORT } from './config'
import { errorsMiddleware } from './middlewares/errorsMiddleware'

import { router as authRouter } from './features/auth/auth.router'
import { router as productRouter } from './features/products/product.router'
import { router as storeRouter } from './features/stores/store.router'

const app = express()

// =========================
// 🔧 MIDDLEWARES
// =========================
app.use(express.json())
app.use(cors())

// =========================
// 🏠 ROOT
// =========================
app.get('/', (req, res) => {
  res.send('API funcionando 🚀')
})

// =========================
// 🚀 ROUTES
// =========================
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/stores', storeRouter)

// =========================
// ❌ ERRORS
// =========================
app.use(errorsMiddleware)

// =========================
// 🟢 LOCAL SERVER ONLY
// =========================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🟢 Server running on http://localhost:${PORT}`)
  })
}

// 👇 EXPORTACIÓN CLAVE PARA VERCEL
export default app