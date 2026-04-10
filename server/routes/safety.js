/**
 * Safety & Incident Response Route
 * 
 * GET  /api/safety/incidents → Live incident feed with severity
 * POST /api/safety/analyze   → AI-powered incident analysis (Gemini multimodal)
 * POST /api/safety/dispatch  → Dispatch resources to incidents
 */

const express = require('express');
const router = express.Router();
const { getModel, SAFETY_SYSTEM_INSTRUCTION } = require('../services/gemini');
const { logEvent } = require('../middleware/logging');
const { recordMetric } = require('../services/monitoring');

/** Simulated live incidents */
const INCIDENTS = [
  {
    id: 'INC-001',
    severity: 5,
    type: 'crowd_crush_risk',
    title: 'Crowd Crush Risk — Gate 3',
    description: 'Density sensor at Gate 3 reports 96% occupancy. Movement velocity has dropped below 0.3 m/s. Potential crowd crush scenario developing.',
    location: 'Gate 3, Level 1',
    detectedBy: 'Vertex AI Vision + IoT Sensors',
    time: 'LIVE',
    status: 'active',
    dispatched: ['Security Team Alpha', 'Medical Unit 1'],
  },
  {
    id: 'INC-002',
    severity: 3,
    type: 'medical',
    title: 'Medical Alert — Section B1',
    description: 'Attendee reported feeling unwell. Nearest medical station notified. Steward dispatched to Row 14, Seat 23.',
    location: 'Section B1, Row 14',
    detectedBy: 'App Report + Steward Confirmation',
    time: '3 MIN AGO',
    status: 'responding',
    dispatched: ['Medical Unit 2'],
  },
  {
    id: 'INC-003',
    severity: 2,
    type: 'unauthorized_access',
    title: 'Unauthorized Area Access — VIP Zone',
    description: 'Camera detected 2 individuals without VIP credentials attempting to enter the VIP lounge via service corridor.',
    location: 'VIP Zone, Service Corridor B',
    detectedBy: 'Gemini Vision + Access Control',
    time: '8 MIN AGO',
    status: 'resolved',
    dispatched: ['Security Unit 3'],
  },
  {
    id: 'INC-004',
    severity: 4,
    type: 'evacuation_risk',
    title: 'Fire Alarm — Concession Area West',
    description: 'Smoke detector triggered in the West Concession kitchen. No visible fire. Kitchen staff evacuating. Fire suppression on standby.',
    location: 'West Concession, Kitchen Area',
    detectedBy: 'IoT Smoke Sensor',
    time: '12 MIN AGO',
    status: 'monitoring',
    dispatched: ['Fire Response Unit', 'Security Team Beta'],
  },
];

/** Available resources */
const RESOURCES = {
  medical: { total: 3, available: 1, deployed: ['Section B1', 'Gate 3'] },
  security: { total: 8, available: 5, deployed: ['Gate 3', 'VIP Zone', 'Parking'] },
  fire: { total: 2, available: 1, deployed: ['West Concession'] },
};

/** ADK Agent statuses */
const AGENTS = [
  { name: 'Crowd Agent', status: 'active', task: 'Monitoring 16 zones, redirecting Gate 3 traffic to Gate 1 & 4' },
  { name: 'Safety Agent', status: 'alert', task: 'Analyzing INC-001 crowd crush risk, generating response plan' },
  { name: 'Comms Agent', status: 'active', task: 'Push notifications sent to 2,400 fans near Gate 3' },
  { name: 'Dispatch Agent', status: 'active', task: 'Coordinating Medical Unit 1 + Security Alpha deployment' },
];

// ─── GET /api/safety/incidents ──────────────────────────────────────────
router.get('/incidents', (req, res) => {
  res.json({
    success: true,
    data: {
      incidents: INCIDENTS,
      resources: RESOURCES,
      agents: AGENTS,
      venue: { totalCapacity: 100024, currentOccupancy: 87521, alertLevel: 'elevated' },
    },
  });
});

// ─── POST /api/safety/analyze ───────────────────────────────────────────
router.post('/analyze', async (req, res) => {
  const { incidentId, description } = req.body;

  if (!incidentId && !description) {
    return res.status(400).json({ error: 'Incident ID or description is required' });
  }

  const incident = INCIDENTS.find(i => i.id === incidentId) || { description: description || 'General safety assessment' };

  try {
    const model = getModel('gemini-2.5-flash-lite');
    const prompt = `Analyze this stadium safety incident and provide a structured response plan:\n\nIncident: ${incident.title || 'Safety Assessment'}\nDescription: ${incident.description}\nLocation: ${incident.location || 'Unknown'}\nSeverity: ${incident.severity || 'TBD'}/5\nCurrent Resources: Medical (${RESOURCES.medical.available}/${RESOURCES.medical.total} available), Security (${RESOURCES.security.available}/${RESOURCES.security.total}), Fire (${RESOURCES.fire.available}/${RESOURCES.fire.total})\nVenue Occupancy: 87,521 / 100,024\n\nProvide:\n1. Risk Assessment (1-2 sentences)\n2. Immediate Actions (3 bullet points)\n3. Resource Deployment recommendation\n4. Estimated Resolution Time`;

    // SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SAFETY_SYSTEM_INSTRUCTION }] },
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

    recordMetric('safety_analysis_count', 1);
    logEvent('INFO', 'Safety analysis completed', { incidentId });

  } catch (err) {
    console.error('[SAFETY] Analysis error:', err.message);
    logEvent('ERROR', 'Safety analysis failed', { error: err.message });

    if (!res.headersSent) {
      return res.status(500).json({ error: 'AI analysis unavailable. Manual assessment required.' });
    }
    res.write(`data: ${JSON.stringify({ error: 'Analysis interrupted.' })}\n\n`);
    res.end();
  }
});

// ─── POST /api/safety/dispatch ──────────────────────────────────────────
router.post('/dispatch', (req, res) => {
  const { incidentId, resourceType, units = 1 } = req.body;

  if (!incidentId || !resourceType) {
    return res.status(400).json({ error: 'Incident ID and resource type are required' });
  }

  const validTypes = ['medical', 'security', 'fire'];
  if (!validTypes.includes(resourceType)) {
    return res.status(400).json({ error: `Resource type must be one of: ${validTypes.join(', ')}` });
  }

  const resource = RESOURCES[resourceType];
  if (resource.available < units) {
    return res.status(409).json({
      error: `Insufficient ${resourceType} units. Available: ${resource.available}/${resource.total}`,
    });
  }

  logEvent('WARN', 'Resource dispatched', { incidentId, resourceType, units });
  recordMetric('safety_dispatch_count', 1);

  res.json({
    success: true,
    data: {
      dispatchId: `DSP-${Date.now().toString(36).toUpperCase()}`,
      incidentId,
      resourceType,
      units,
      estimatedArrival: `${Math.floor(Math.random() * 3) + 2} min`,
      status: 'en_route',
    },
  });
});

module.exports = router;
