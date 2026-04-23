import express from 'express'
import cors from 'cors'

import { PORT } from './config'
import { errorsMiddleware } from './middlewares/errorsMiddleware'

import { router as authRouter } from './features/auth/auth.router'
import { router as productRouter } from './features/products/product.router'
import { router as storeRouter } from './features/stores/store.router'
import { router as orderRouter } from './features/orders/order.router'

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.json({
    message: 'API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      stores: '/api/stores',
      auth: '/api/auth/login',
      products: '/api/products',
      orders: '/api/orders',
      health: '/api/health',
    },
  })
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/stores', storeRouter)
app.use('/api/orders', orderRouter)

// Keep /auth and /stores public aliases for backwards compat
app.use('/auth', authRouter)
app.use('/stores', storeRouter)
app.use('/products', productRouter)
app.use('/orders', orderRouter)

app.use(errorsMiddleware)

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

export default app
