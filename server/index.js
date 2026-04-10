/**
 * Sporty-AI Server — Express.js Backend
 * 
 * Serves the React frontend + API routes with full security middleware.
 * Integrates 9 Google Cloud services for intelligent stadium management.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const path = require('path');
const { setupSecurity } = require('./middleware/security');
const { setupLogging } = require('./middleware/logging');

const chatRouter = require('./routes/chat');
const predictRouter = require('./routes/predict');
const alertsRouter = require('./routes/alerts');
const crowdRouter = require('./routes/crowd');
const healthRouter = require('./routes/health');
const metricsRouter = require('./routes/metrics');
const foodRouter = require('./routes/food');
const safetyRouter = require('./routes/safety');

const app = express();

// Trust Cloud Run reverse proxy (only in production)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

// ─── Static Frontend (BEFORE security middleware) ──────────────────────────
// Static files don't need CORS, rate limiting, or body parsing.
// Serving them first avoids Helmet CSP / CORS interference with asset MIME types.
const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  index: 'index.html',
}));

// ─── Security middleware (for API routes only) ─────────────────────────────
setupSecurity(app);

// Logging middleware (Morgan + Cloud Logging)
setupLogging(app);

// Parse JSON with strict body size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/predict', predictRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/crowd', crowdRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/food', foodRouter);
app.use('/api/safety', safetyRouter);

// ─── SPA Fallback ──────────────────────────────────────────────────────────
// Serve index.html for all non-API, non-static routes (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  console.error('[ERROR] Stack:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    path: req.originalUrl,
  });
});

const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Push live crowd updates every 5 seconds (zero-polling architecture)
  const crowdInterval = setInterval(() => {
    socket.emit('crowd_update', {
      timestamp: new Date().toISOString(),
      zones: [
        { id: 'gate-1', density: Math.random() * 0.9, waitTime: Math.floor(Math.random() * 20) },
        { id: 'concourse-a', density: Math.random() * 0.9, waitTime: Math.floor(Math.random() * 15) },
        { id: 'section-104', density: Math.random() * 0.9, waitTime: Math.floor(Math.random() * 5) }
      ]
    });
  }, 5000);

  socket.on('disconnect', () => {
    clearInterval(crowdInterval);
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 8080;
server.listen(PORT, () => {
  console.log(`\n  ⚡ Sporty-AI server running on port ${PORT}`);
  console.log(`  📂 Static: ${clientDist}`);
  console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  🔒 Security middleware: active`);
  console.log(`  🔌 WebSockets: active\n`);
});

module.exports = { app, server, io };
