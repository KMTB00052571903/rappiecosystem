import express from 'express';
import serverless from 'serverless-http';

const app = express();

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ API funcionando correctamente',
    timestamp: new Date().toISOString(),
    rutas_disponibles: [
      '/api/test',
      '/api/stores',
      '/api/auth/login',
      '/api/health'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// 🔥 ESTE ES EL CAMBIO IMPORTANTE
export default serverless(app);