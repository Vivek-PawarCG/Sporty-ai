/**
 * GCP Monitoring Service
 * 
 * Records custom metrics to Google Cloud Monitoring
 * for observability and performance tracking.
 */

let metricsClient = null;

/**
 * Returns a singleton Monitoring client.
 */
function getMetricsClient() {
  if (!metricsClient) {
    try {
      const monitoring = require('@google-cloud/monitoring');
      metricsClient = new monitoring.MetricServiceClient();
      console.log('[MONITORING] Client initialized');
    } catch (err) {
      console.warn('[MONITORING] Not available:', err.message);
    }
  }
  return metricsClient;
}

/**
 * Records a custom metric value to GCP Monitoring.
 * @param {string} metricType - Metric name (e.g., 'chat_latency_ms', 'active_users')
 * @param {number} value - Metric value
 * @param {Object} [labels={}] - Additional metric labels
 */
async function recordMetric(metricType, value, labels = {}) {
  const client = getMetricsClient();
  if (!client || !process.env.GCP_PROJECT_ID) {
    console.log(`[METRICS] ${metricType}: ${value}`, labels);
    return;
  }

  try {
    const projectPath = client.projectPath(process.env.GCP_PROJECT_ID);
    const now = Date.now() / 1000;

    const timeSeriesData = {
      metric: {
        type: `custom.googleapis.com/sporty_ai/${metricType}`,
        labels,
      },
      resource: {
        type: 'global',
        labels: { project_id: process.env.GCP_PROJECT_ID },
      },
      points: [{
        interval: { endTime: { seconds: Math.floor(now) } },
        value: { doubleValue: value },
      }],
    };

    await client.createTimeSeries({
      name: projectPath,
      timeSeries: [timeSeriesData],
    });
  } catch (err) {
    console.warn(`[MONITORING] Failed to record metric '${metricType}':`, err.message);
  }
}

module.exports = { recordMetric };
