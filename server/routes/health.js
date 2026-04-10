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
  const geminiKey = process.env.GEMINI_API_KEY;
  res.json({
    status: 'healthy',
    service: 'sporty-ai',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    services: {
      gemini: !!geminiKey,
      geminiKeyLength: geminiKey ? geminiKey.length : 0,
      gcp: !!process.env.GCP_PROJECT_ID,
      gcpProject: process.env.GCP_PROJECT_ID || 'not set',
    },
  });
});

module.exports = router;
