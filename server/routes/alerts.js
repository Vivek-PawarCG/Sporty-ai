/**
 * Alerts Route — Safety & Incident Response
 * GET /api/alerts
 * POST /api/alerts/generate
 * 
 * Provides real-time safety alerts and uses Gemini
 * to generate incident response recommendations.
 */

const express = require('express');
const router = express.Router();
const { getModel } = require('../services/gemini');
const { logEvent } = require('../middleware/logging');

/** Simulated real-time alerts feed */
const LIVE_ALERTS = [
  {
    id: 'alert-001',
    severity: 'critical',
    icon: 'alert-triangle',
    color: '#ff5252',
    title: 'High Density — Section B1',
    description: 'Crowd density at 95%. AI agent redirecting 300+ fans to Section C via smart signage. Security team deployed to manage flow.',
    time: 'NOW',
    timestamp: new Date().toISOString(),
    zone: 'B1',
    actionTaken: 'Auto-redirect activated',
  },
  {
    id: 'alert-002',
    severity: 'warning',
    icon: 'clock',
    color: '#ffd740',
    title: 'Long Queue — North Concession',
    description: '19-min wait predicted. Push notification sent to 1,200 nearby fans suggesting South Concession (5-min wait).',
    time: '2 MIN AGO',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    zone: 'Food1',
    actionTaken: 'Alternative suggested via app',
  },
  {
    id: 'alert-003',
    severity: 'resolved',
    icon: 'check-circle',
    color: '#00e676',
    title: 'Gate 1 Entry Cleared',
    description: 'Staggered entry complete. AI reduced average entry time from 18 min to 4 min. Gates 2 & 4 nominal.',
    time: '8 MIN AGO',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    zone: 'Gate1',
    actionTaken: 'Resolved automatically',
  },
  {
    id: 'alert-004',
    severity: 'info',
    icon: 'info',
    color: '#448aff',
    title: 'Weather Update',
    description: 'Light rain expected at 7:30 PM. Covered seating areas available in Sections A and VIP. Ponchos available at merchandise stands.',
    time: '12 MIN AGO',
    timestamp: new Date(Date.now() - 720000).toISOString(),
    zone: 'all',
    actionTaken: 'Proactive notification sent',
  },
];

// GET /api/alerts — Return current alerts
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: LIVE_ALERTS,
    meta: {
      timestamp: new Date().toISOString(),
      total: LIVE_ALERTS.length,
    },
  });
});

// POST /api/alerts/generate — AI-generated alert analysis
router.post('/generate', async (req, res) => {
  const { crowdData } = req.body;

  try {
    const model = getModel('gemini-2.0-flash');
    const prompt = `You are a stadium safety AI. Analyze this crowd data and generate 1-2 safety alerts if any zones are concerning. 
    
Current data: ${JSON.stringify(crowdData || LIVE_ALERTS)}

Return a JSON array of alerts with format: [{ "severity": "critical|warning|info", "title": "short title", "description": "actionable description", "zone": "zone_id", "recommendation": "what to do" }]

Only generate alerts for genuinely concerning conditions. If everything is safe, return an empty array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let alerts = [];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        alerts = JSON.parse(jsonMatch[0]);
      }
    } catch {
      alerts = [{ severity: 'info', title: 'Analysis Complete', description: text }];
    }

    logEvent('INFO', 'AI alert analysis completed', { alertCount: alerts.length });

    res.json({ success: true, data: alerts });
  } catch (err) {
    console.error('[ALERTS] Generation error:', err.message);
    res.status(500).json({ error: 'Alert generation failed' });
  }
});

module.exports = router;
