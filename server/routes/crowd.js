/**
 * Crowd Route — Real-Time Crowd Data
 * GET /api/crowd
 * 
 * Returns live crowd density data for all venue zones.
 * Uses BigQuery for historical analysis and simulated
 * sensor data for real-time display.
 */

const express = require('express');
const router = express.Router();
const { getCrowdAnalytics } = require('../services/bigquery');

/** Base crowd density data for venue zones */
const BASE_CROWD_DATA = [
  { label: 'VIP', density: 0.2, capacity: 5000, type: 'seating' },
  { label: 'A1', density: 0.85, capacity: 12000, type: 'seating' },
  { label: 'A2', density: 0.4, capacity: 12000, type: 'seating' },
  { label: 'B1', density: 0.95, capacity: 15000, type: 'seating' },
  { label: 'B2', density: 0.3, capacity: 15000, type: 'seating' },
  { label: 'C1', density: 0.6, capacity: 10000, type: 'seating' },
  { label: 'C2', density: 0.15, capacity: 10000, type: 'seating' },
  { label: 'Exit', density: 0.7, capacity: 2000, type: 'passage' },
  { label: 'Gate1', density: 0.9, capacity: 1500, type: 'entry' },
  { label: 'Gate2', density: 0.25, capacity: 1500, type: 'entry' },
  { label: 'Gate3', density: 0.55, capacity: 1500, type: 'entry' },
  { label: 'Gate4', density: 0.4, capacity: 1500, type: 'entry' },
  { label: 'Merch', density: 0.8, capacity: 800, type: 'facility' },
  { label: 'Food1', density: 0.65, capacity: 600, type: 'facility' },
  { label: 'Food2', density: 0.3, capacity: 600, type: 'facility' },
  { label: 'Parking', density: 0.45, capacity: 3000, type: 'external' },
];

// GET /api/crowd — Return live crowd data with fluctuation
router.get('/', async (req, res) => {
  try {
    // Attempt BigQuery historical analytics
    let historical = null;
    try {
      historical = await getCrowdAnalytics('mcg', 60);
    } catch {
      // BigQuery may not be set up — use simulated data
    }

    // Generate live data with realistic fluctuation
    const liveData = BASE_CROWD_DATA.map(zone => {
      const fluctuation = (Math.random() - 0.5) * 0.12;
      const currentDensity = Math.min(0.99, Math.max(0.05, zone.density + fluctuation));
      const occupancy = Math.floor(currentDensity * zone.capacity);

      return {
        ...zone,
        density: +currentDensity.toFixed(2),
        occupancy,
        status: currentDensity < 0.35 ? 'low' : currentDensity < 0.65 ? 'moderate' : 'high',
      };
    });

    res.json({
      success: true,
      data: {
        live: liveData,
        historical,
        venue: {
          name: 'Melbourne Cricket Ground',
          totalCapacity: 100024,
          currentOccupancy: liveData.reduce((sum, z) => sum + z.occupancy, 0),
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        source: historical ? 'bigquery+sensors' : 'simulated-sensors',
      },
    });
  } catch (err) {
    console.error('[CROWD] Error:', err.message);
    res.status(500).json({ error: 'Crowd data service unavailable' });
  }
});

module.exports = router;
