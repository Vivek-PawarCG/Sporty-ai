/**
 * BigQuery Service
 * 
 * Provides BigQuery client for querying historical
 * crowd analytics and event data.
 */

let bqClient = null;

/**
 * Returns a singleton BigQuery client.
 */
function getBigQuery() {
  if (!bqClient) {
    try {
      const { BigQuery } = require('@google-cloud/bigquery');
      bqClient = new BigQuery({
        projectId: process.env.GCP_PROJECT_ID,
      });
      console.log('[BIGQUERY] Client initialized');
    } catch (err) {
      console.warn('[BIGQUERY] Not available:', err.message);
    }
  }
  return bqClient;
}

/**
 * Queries historical crowd density analytics.
 * @param {string} venueId - Venue identifier
 * @param {number} minutesBack - Time range in minutes
 * @returns {Promise<Array>} Query results
 */
async function getCrowdAnalytics(venueId = 'mcg', minutesBack = 60) {
  const bq = getBigQuery();

  if (bq) {
    try {
      const query = `
        SELECT zone_id, 
               AVG(density) as avg_density, 
               MAX(density) as peak_density,
               MIN(density) as min_density,
               COUNT(*) as data_points
        FROM \`${process.env.GCP_PROJECT_ID}.sporty_ai.crowd_data\`
        WHERE venue_id = @venueId
          AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @minutes MINUTE)
        GROUP BY zone_id
        ORDER BY avg_density DESC
      `;
      const [rows] = await bq.query({
        query,
        params: { venueId, minutes: minutesBack },
      });
      return rows;
    } catch (err) {
      console.warn('[BIGQUERY] Query failed:', err.message);
    }
  }

  // Fallback — simulated historical data
  const zones = ['VIP', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Gate1', 'Gate2', 'Gate3', 'Gate4', 'Food1', 'Food2', 'Merch', 'Parking', 'Exit'];
  return zones.map(zone => ({
    zone_id: zone,
    avg_density: +(Math.random() * 0.8 + 0.1).toFixed(2),
    peak_density: +(Math.random() * 0.3 + 0.7).toFixed(2),
    min_density: +(Math.random() * 0.2 + 0.05).toFixed(2),
    data_points: Math.floor(Math.random() * 50) + 10,
  }));
}

/**
 * Logs an event to BigQuery for analytics.
 * @param {Object} eventData - Event data to log
 */
async function logEventToBQ(eventData) {
  const bq = getBigQuery();
  if (!bq) return;

  try {
    await bq.dataset('sporty_ai').table('events').insert([{
      ...eventData,
      timestamp: new Date().toISOString(),
    }]);
  } catch (err) {
    console.warn('[BIGQUERY] Insert failed:', err.message);
  }
}

module.exports = { getBigQuery, getCrowdAnalytics, logEventToBQ };
