/**
 * Security Middleware Stack
 * 
 * Configures Helmet, CORS, rate limiting, HPP protection,
 * and gzip compression for the Express application.
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');

/**
 * Sets up all security middleware on the Express app.
 * @param {import('express').Application} app
 */
function setupSecurity(app) {
  // Helmet — sets 11+ security HTTP headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://*.googleapis.com",
          "https://*.firebaseio.com",
          "https://*.firebaseapp.com",
          "wss://*.firebaseio.com",
        ],
        imgSrc: ["'self'", "data:", "blob:", "https://*.googleusercontent.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow Google Fonts loading
  }));

  // CORS — restrict to allowed origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3001'];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (no origin header) — this covers
      // Cloud Run monolith where frontend & backend share the same URL
      if (!origin) return callback(null, true);
      // Allow configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow all Cloud Run URLs (*.run.app)
      if (origin.endsWith('.run.app')) return callback(null, true);
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  }));

  // Rate Limiting — 100 requests per 15 minutes per IP
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
    skip: (req) => req.path === '/api/health', // Don't rate-limit health checks
  });
  app.use('/api/', apiLimiter);

  // Stricter limiter for AI chat (expensive API calls)
  const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minute
    max: 10,                    // 10 messages per minute
    message: { error: 'Chat rate limit exceeded. Please wait a moment.' },
  });
  app.use('/api/chat', chatLimiter);

  // HPP — prevent HTTP parameter pollution
  app.use(hpp());

  // Compression — gzip responses
  app.use(compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  }));
}

module.exports = { setupSecurity };
