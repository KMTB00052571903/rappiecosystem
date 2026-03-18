const express = require('express');
const serverless = require('serverless-http');

const app = express();

app.get('/api/test', (req, res) => {
  res.json({
    message: '🔥 FUNCIONA POR FIN 🔥',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = serverless(app);