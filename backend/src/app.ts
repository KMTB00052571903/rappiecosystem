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
// 🏠 ROOT - SOLO UNA VEZ
// =========================
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      stores: '/stores o /api/stores',
      auth: '/auth/login o /api/auth/login',
      products: '/products o /api/products',
      health: '/health o /api/health'
    }
  });
});

// =========================
// ✅ RUTA DE SALUD
// =========================
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =========================
// 🚀 ROUTES - CON Y SIN /api
// =========================

// Versión con /api (más común en APIs)
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/stores', storeRouter)

// Versión sin /api (para compatibilidad)
app.use('/auth', authRouter)
app.use('/products', productRouter)
app.use('/stores', storeRouter)

// =========================
// ❌ ERRORS (siempre al final)
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

// =========================
// 📤 EXPORTACIÓN CLAVE PARA VERCEL
// =========================
export default app