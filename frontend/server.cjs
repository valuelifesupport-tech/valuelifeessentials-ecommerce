const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for safety
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'ValueLife Essentials Frontend' });
});

// Reverse proxy /api requests to backend server (port 5000)
const http = require('http');
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
app.use('/api', (req, res) => {
  const targetUrl = new URL(req.originalUrl, BACKEND_URL);
  const proxyReq = http.request(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrl.host
    }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (err) => {
    res.status(502).json({ error: 'Backend proxy error', details: err.message });
  });
  req.pipe(proxyReq);
});

// Serve compiled static assets from dist/
app.use(express.static(path.join(__dirname, 'dist'), { maxAge: '1h' }));

// SPA fallback for all sub-routes (e.g. /admin, /products, /offers)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend static SPA server listening on port ${PORT} (0.0.0.0)`);
});

module.exports = app;
