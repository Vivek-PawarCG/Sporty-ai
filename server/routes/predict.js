/**
 * Predict Route — Wait Time Forecasts
 * POST /api/predict
 * 
 * Uses Vertex AI / Gemini to generate predictive
 * wait time forecasts for venue facilities.
 */

const express = require('express');
const router = express.Router();
const { generatePrediction } = require('../services/vertexai');
const { recordMetric } = require('../services/monitoring');

/** Current venue facility data (simulated sensor input) */
const VENUE_ZONES = [
  { label: 'VIP', density: 0.2 },
  { label: 'A1', density: 0.85 },
  { label: 'A2', density: 0.4 },
  { label: 'B1', density: 0.95 },
  { label: 'B2', density: 0.3 },
  { label: 'C1', density: 0.6 },
  { label: 'C2', density: 0.15 },
  { label: 'Exit', density: 0.7 },
  { label: 'Gate1', density: 0.9 },
  { label: 'Gate2', density: 0.25 },
  { label: 'Gate3', density: 0.55 },
  { label: 'Gate4', density: 0.4 },
  { label: 'Merch', density: 0.8 },
  { label: 'Food1', density: 0.65 },
  { label: 'Food2', density: 0.3 },
  { label: 'Parking', density: 0.45 },
];

router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    // Add random fluctuation to simulate live sensor data
    const liveData = VENUE_ZONES.map(zone => ({
      ...zone,
      density: Math.min(0.99, Math.max(0.05, zone.density + (Math.random() - 0.5) * 0.12)),
    }));

    const predictions = await generatePrediction(liveData);

    const latency = Date.now() - startTime;
    recordMetric('predict_latency_ms', latency);

    res.json({
      success: true,
      data: predictions,
      meta: {
        timestamp: new Date().toISOString(),
        model: 'vertex-ai-gemini-2.0-flash',
        latencyMs: latency,
      },
    });
  } catch (err) {
    console.error('[PREDICT] Error:', err.message);
    res.status(500).json({ error: 'Prediction service unavailable' });
  }
});

module.exports = router;
