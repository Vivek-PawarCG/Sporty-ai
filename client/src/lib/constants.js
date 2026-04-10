/**
 * Constants — Static data for Sporty-AI
 * All venue, feature, and architecture data.
 */

export const FEATURES = [
  {
    icon: 'Bot',
    title: 'Gemini AI Concierge',
    text: 'Attendees ask anything via voice or text — gate directions, food orders, nearest restroom, seat upgrades. Gemini 2.0 Flash responds in <1s in multiple languages.',
    tag: 'Gemini 2.0 Flash',
  },
  {
    icon: 'Map',
    title: 'Real-Time Crowd Flow',
    text: 'Vertex AI Vision analyzes CCTV feeds to detect crowd density per zone. AI reroutes attendees to uncrowded gates, toilets, and concession stalls in real time.',
    tag: 'Vertex AI Vision',
  },
  {
    icon: 'Timer',
    title: 'Predictive Wait Times',
    text: 'ML models trained on historical event data predict queue lengths 15 minutes ahead. Push notifications alert fans before lines build up.',
    tag: 'Vertex AI Forecast',
  },
  {
    icon: 'Ticket',
    title: 'Smart Entry Orchestration',
    text: 'Gemini agents dynamically open/close gates, send staggered entry nudges, and coordinate security staff placement to eliminate bottlenecks.',
    tag: 'Gemini Agents + ADK',
  },
  {
    icon: 'UtensilsCrossed',
    title: 'AI Food & Beverage',
    text: 'Order food to your seat via the app. Gemma 3 on-device model personalizes menu suggestions. Concession robots receive AI-dispatched orders.',
    tag: 'Gemma 3 (On-device)',
  },
  {
    icon: 'ShieldAlert',
    title: 'Safety & Incident Response',
    text: 'Multimodal Gemini detects anomalies (crowd crush, medical emergency) from video + audio and dispatches safety staff with AI-generated response plans.',
    tag: 'Gemini Multimodal',
  },
];

export const ARCH_LAYERS = [
  {
    title: 'Attendee Layer',
    chips: ['Mobile App (PWA)', 'Voice Assistant', 'Smart Wristband', 'Digital Signage', 'WhatsApp Bot'],
  },
  {
    title: 'AI & Intelligence Layer',
    chips: ['Gemini 2.0 Flash API', 'Gemma 3 On-Device', 'Vertex AI Vision', 'Vertex AI Forecast', 'Google ADK Agents', 'Multimodal RAG'],
  },
  {
    title: 'Data & Sensing Layer',
    chips: ['CCTV / IP Cameras', 'IoT Crowd Sensors', 'POS Systems', 'Ticketing DB', 'Weather API', 'BLE Beacons'],
  },
  {
    title: 'Platform Layer',
    chips: ['Google Cloud Run', 'Firestore Realtime DB', 'Pub/Sub Streaming', 'BigQuery Analytics', 'Firebase Auth', 'Cloud CDN'],
  },
];

export const CROWD_DATA = [
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

export const WAIT_ITEMS = [
  { icon: 'Sandwich', name: 'North Concession', mins: 19, max: 30, color: '#ff5252' },
  { icon: 'Beer', name: 'Beer Garden', mins: 7, max: 30, color: '#00e676' },
  { icon: 'Bath', name: 'Restrooms — East Wing', mins: 4, max: 30, color: '#00e676' },
  { icon: 'Bath', name: 'Restrooms — West Wing', mins: 16, max: 30, color: '#ffd740' },
  { icon: 'Ticket', name: 'Gate B Entry', mins: 11, max: 30, color: '#ffd740' },
  { icon: 'Car', name: 'Parking Exit', mins: 25, max: 30, color: '#ff5252' },
];

export const ALERTS = [
  {
    severity: 'critical',
    icon: 'AlertTriangle',
    color: '#ff5252',
    title: 'High Density — Section B1',
    desc: 'Crowd density at 95%. AI agent redirecting 300+ fans to Section C via smart signage. Security team deployed.',
    time: 'NOW',
  },
  {
    severity: 'warning',
    icon: 'Clock',
    color: '#ffd740',
    title: 'Long Queue — North Concession',
    desc: '19-min wait predicted. Push notification sent to 1,200 nearby fans suggesting South Concession (5-min wait).',
    time: '2 MIN AGO',
  },
  {
    severity: 'resolved',
    icon: 'CheckCircle',
    color: '#00e676',
    title: 'Gate 1 Entry Cleared',
    desc: 'Staggered entry complete. AI reduced average entry time from 18 min to 4 min. Gates 2 & 4 nominal.',
    time: '8 MIN AGO',
  },
  {
    severity: 'info',
    icon: 'Info',
    color: '#448aff',
    title: 'Weather Update',
    desc: 'Light rain expected at 7:30 PM. Covered seating in Sections A and VIP. Ponchos at merchandise stands.',
    time: '12 MIN AGO',
  },
];

export const ROADMAP = [
  {
    phase: 'Phase 1 — MVP',
    done: true,
    color: '#00e676',
    title: 'Gemini AI Concierge + Crowd Map',
    desc: 'Mobile PWA with voice/text queries. Real-time crowd density heatmap from CCTV feeds using Vertex AI Vision.',
  },
  {
    phase: 'Phase 2',
    done: true,
    color: '#00e676',
    title: 'Predictive Wait Times + Smart Alerts',
    desc: 'Vertex AI Forecast model. Push notifications. Staff coordination dashboard with real-time insights.',
  },
  {
    phase: 'Phase 3',
    done: false,
    color: '#ffd740',
    title: 'Seat-to-Seat F&B + Gemma On-Device',
    desc: 'Order food from app. Gemma 3 personalizes menu. BLE beacon-based precise indoor location.',
  },
  {
    phase: 'Phase 4',
    done: false,
    color: 'rgba(224,255,232,0.2)',
    title: 'Multimodal Safety & Full Venue Autonomy',
    desc: 'AI safety detection, incident response agents, full ADK orchestration across all venue systems.',
  },
];

export const STATS = [
  { value: '↓68%', label: 'Wait Time Reduction' },
  { value: '<1s', label: 'AI Response Latency' },
  { value: '100K+', label: 'Attendees Served' },
  { value: '99.9%', label: 'Safety Detection' },
];

/**
 * Returns the appropriate color for a crowd density value.
 * @param {number} density - Value between 0 and 1
 * @returns {string} Hex color
 */
export function densityColor(density) {
  if (density < 0.35) return '#00e676';
  if (density < 0.65) return '#ffd740';
  return '#ff5252';
}

/**
 * Returns a human-readable density status.
 * @param {number} density - Value between 0 and 1
 * @returns {string}
 */
export function densityStatus(density) {
  if (density < 0.35) return 'Low';
  if (density < 0.65) return 'Moderate';
  return 'High';
}
