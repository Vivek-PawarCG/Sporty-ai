/**
 * Metrics Route — Cloud Logging integration
 * POST /api/metrics
 * 
 * Accepts client-side events and logs them to
 * Google Cloud Logging for analytics.
 */

const express = require('express');
const router = express.Router();
const { logEvent } = require('../middleware/logging');

router.post('/', async (req, res) => {
  const { event, data = {} } = req.body;

  if (!event || typeof event !== 'string') {
    return res.status(400).json({ error: 'Event name is required' });
  }

  try {
    await logEvent('INFO', `Client event: ${event}`, {
      ...data,
      clientIp: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[METRICS] Log error:', err.message);
    res.status(500).json({ error: 'Logging failed' });
  }
});

module.exports = router;
