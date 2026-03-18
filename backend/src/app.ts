import express from 'express'
import { NODE_ENV, PORT } from './config'
import cors from 'cors'

import { errorsMiddleware } from './middlewares/errorsMiddleware'

import { router as authRouter } from './features/auth/auth.router'
import { router as productRouter } from './features/products/product.router'
import { router as storeRouter } from './features/stores/store.router'

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello, World!!!!!')
})

// =========================
// 🚀 ROUTES
// =========================
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/stores', storeRouter) // 🔥 ESTA ERA LA QUE FALTABA

// =========================
// ❌ ERRORS
// =========================
app.use(errorsMiddleware)

// =========================
// 🟢 SERVER
// =========================
if (NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT)
  })
}

export default app