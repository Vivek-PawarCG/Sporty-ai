/**
 * Logging Middleware
 * 
 * Integrates Morgan for HTTP request logging and
 * Google Cloud Logging for structured production logs.
 */

const morgan = require('morgan');

/** @type {import('@google-cloud/logging').Logging | null} */
let cloudLogger = null;

/**
 * Initializes Google Cloud Logging client.
 * Falls back gracefully if not in a GCP environment.
 */
async function initCloudLogging() {
  try {
    const { Logging } = require('@google-cloud/logging');
    const logging = new Logging({
      projectId: process.env.GCP_PROJECT_ID,
    });
    cloudLogger = logging.log('sporty-ai-server');
    console.log('[LOGGING] Cloud Logging initialized');
  } catch (err) {
    console.warn('[LOGGING] Cloud Logging not available, using console only');
  }
}

/**
 * Writes a structured log entry to Cloud Logging.
 * @param {'INFO'|'WARNING'|'ERROR'|'DEBUG'} severity
 * @param {string} message
 * @param {Object} [metadata={}]
 */
async function logEvent(severity, message, metadata = {}) {
  const payload = {
    message,
    timestamp: new Date().toISOString(),
    service: 'sporty-ai',
    ...metadata,
  };

  // Always log to console
  const consoleFn = severity === 'ERROR' ? console.error : console.log;
  consoleFn(`[${severity}] ${message}`, metadata);

  // Write to Cloud Logging if available
  if (cloudLogger) {
    try {
      const entry = cloudLogger.entry(
        { resource: { type: 'global' }, severity },
        payload
      );
      await cloudLogger.write(entry);
    } catch (err) {
      console.warn('[LOGGING] Failed to write to Cloud Logging:', err.message);
    }
  }
}

/**
 * Sets up Morgan HTTP request logging on the Express app.
 * @param {import('express').Application} app
 */
function setupLogging(app) {
  // Initialize Cloud Logging in background
  initCloudLogging();

  // Morgan — structured HTTP request logging
  const format = process.env.NODE_ENV === 'production'
    ? 'combined'
    : 'dev';

  app.use(morgan(format, {
    skip: (req) => req.path === '/api/health', // Don't log health checks
  }));
}

module.exports = { setupLogging, logEvent };
