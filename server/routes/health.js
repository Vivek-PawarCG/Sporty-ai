/**
 * Health Check Route
 * GET /api/health
 * 
 * Returns server health status and service availability.
 * Used by Cloud Run for startup/liveness probes.
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'sporty-ai',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    services: {
      gemini: !!process.env.GEMINI_API_KEY,
      gcp: !!process.env.GCP_PROJECT_ID,
      firebase: !!process.env.FIREBASE_PROJECT_ID,
    },
  });
});

module.exports = router;
