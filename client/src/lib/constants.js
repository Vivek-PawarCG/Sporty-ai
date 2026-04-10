/**
 * Constants — Static data for Sporty-AI
 * Venue, feature, and architecture data.
 */

export const FEATURES = [
  {
    icon: 'Bot',
    title: 'AI Concierge',
    text: 'Ask anything — directions, food, restrooms, seat upgrades. Instant responses in multiple languages.',
    tag: 'Gemini 2.5 Flash Lite Flash',
  },
  {
    icon: 'Map',
    title: 'Crowd Flow',
    text: 'Live crowd density per zone. AI reroutes you to uncrowded gates and concessions automatically.',
    tag: 'Vertex AI Vision',
  },
  {
    icon: 'Timer',
    title: 'Wait Times',
    text: 'Predicts queue lengths 15 min ahead. Get notified before lines build up.',
    tag: 'Vertex AI Forecast',
  },
  {
    icon: 'Ticket',
    title: 'Smart Entry',
    text: 'Dynamic gate management with staggered entry to eliminate bottlenecks.',
    tag: 'ADK Agents',
  },
  {
    icon: 'UtensilsCrossed',
    title: 'Food to Seat',
    text: 'Order from the app. AI personalizes your menu. Delivered to your seat.',
    tag: 'Gemma 3 On-Device',
  },
  {
    icon: 'ShieldAlert',
    title: 'Safety AI',
    text: 'Detects anomalies from video + audio. Auto-dispatches staff with AI response plans.',
    tag: 'Gemini Multimodal',
  },
];

export const ARCH_LAYERS = [
  {
    title: 'Attendee Layer',
    chips: ['Mobile App', 'Voice Assistant', 'Smart Wristband', 'Digital Signage'],
  },
  {
    title: 'AI & Intelligence',
    chips: ['Gemini 2.5 Flash Lite Flash', 'Gemma 3', 'Vertex AI Vision', 'Vertex AI Forecast', 'Google ADK'],
  },
  {
    title: 'Data & Sensing',
    chips: ['CCTV Feeds', 'IoT Sensors', 'POS Systems', 'BLE Beacons', 'Weather API'],
  },
  {
    title: 'Platform',
    chips: ['Cloud Run', 'Firestore', 'BigQuery', 'Pub/Sub', 'Firebase Auth', 'Secret Manager'],
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
  { icon: 'Bath', name: 'Restrooms East', mins: 4, max: 30, color: '#00e676' },
  { icon: 'Bath', name: 'Restrooms West', mins: 16, max: 30, color: '#ffd740' },
  { icon: 'Ticket', name: 'Gate B Entry', mins: 11, max: 30, color: '#ffd740' },
  { icon: 'Car', name: 'Parking Exit', mins: 25, max: 30, color: '#ff5252' },
];

export const ALERTS = [
  {
    severity: 'critical',
    icon: 'AlertTriangle',
    color: '#ff5252',
    title: 'High Density — Section B1',
    desc: '95% capacity. Redirecting 300+ fans to Section C. Security deployed.',
    time: 'NOW',
  },
  {
    severity: 'warning',
    icon: 'Clock',
    color: '#ffd740',
    title: 'Long Queue — North Concession',
    desc: '19-min wait. Notifying nearby fans to try South Concession (5 min).',
    time: '2 MIN AGO',
  },
  {
    severity: 'resolved',
    icon: 'CheckCircle',
    color: '#00e676',
    title: 'Gate 1 Entry Cleared',
    desc: 'Entry time reduced from 18 min to 4 min. All gates nominal.',
    time: '8 MIN AGO',
  },
  {
    severity: 'info',
    icon: 'Info',
    color: '#448aff',
    title: 'Weather Update',
    desc: 'Light rain at 7:30 PM. Covered seating in Sections A & VIP.',
    time: '12 MIN AGO',
  },
];

export const ROADMAP = [
  {
    phase: 'Phase 1',
    done: true,
    color: '#00e676',
    title: 'AI Concierge + Crowd Map',
    desc: 'Voice/text queries with real-time crowd density heatmap.',
  },
  {
    phase: 'Phase 2',
    done: true,
    color: '#00e676',
    title: 'Wait Times + Alerts',
    desc: 'Predictive queue models with push notifications.',
  },
  {
    phase: 'Phase 3',
    done: true,
    color: '#00e676',
    title: 'Food to Seat + BLE Location',
    desc: 'In-app ordering with AI menu personalization.',
  },
  {
    phase: 'Phase 4',
    done: true,
    color: '#00e676',
    title: 'Safety AI + Venue Autonomy',
    desc: 'Incident detection and coordinated AI agent response.',
  },
];

export const STATS = [
  { value: '↓68%', label: 'Wait Reduction' },
  { value: '<1s', label: 'AI Response' },
  { value: '100K+', label: 'Capacity' },
  { value: '99.9%', label: 'Safety Accuracy' },
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
