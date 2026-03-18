import express from 'express';
import serverless from 'serverless-http';

const app = express();

// Ruta de prueba que DEBERÍA funcionar siempre
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

// Capturar todas las rutas para debug
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    mensaje: 'La ruta que buscas no está definida en esta función de prueba'
  });
});

export const handler = serverless(app);