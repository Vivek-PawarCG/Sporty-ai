/**
 * Secret Manager Service
 * 
 * Securely retrieves API keys and credentials from
 * Google Cloud Secret Manager with in-memory caching.
 */

let secretClient = null;
const cache = new Map();

/**
 * Returns a singleton Secret Manager client.
 */
function getSecretClient() {
  if (!secretClient) {
    try {
      const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
      secretClient = new SecretManagerServiceClient();
      console.log('[SECRET MANAGER] Client initialized');
    } catch (err) {
      console.warn('[SECRET MANAGER] Not available:', err.message);
    }
  }
  return secretClient;
}

/**
 * Retrieves a secret value from Secret Manager.
 * Results are cached in memory to avoid repeated API calls.
 * Falls back to environment variables if Secret Manager is unavailable.
 * 
 * @param {string} secretName - Name of the secret
 * @returns {Promise<string>} Secret value
 */
async function getSecret(secretName) {
  // Check cache first
  if (cache.has(secretName)) {
    return cache.get(secretName);
  }

  const client = getSecretClient();

  if (client && process.env.GCP_PROJECT_ID) {
    try {
      const name = `projects/${process.env.GCP_PROJECT_ID}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      const value = version.payload.data.toString('utf8');
      cache.set(secretName, value);
      return value;
    } catch (err) {
      console.warn(`[SECRET MANAGER] Failed to fetch '${secretName}':`, err.message);
    }
  }

  // Fallback to environment variables
  const envValue = process.env[secretName];
  if (envValue) {
    cache.set(secretName, envValue);
    return envValue;
  }

  throw new Error(`Secret '${secretName}' not found in Secret Manager or environment`);
}

/**
 * Clears the secret cache. Useful for key rotation scenarios.
 */
function clearCache() {
  cache.clear();
}

module.exports = { getSecret, clearCache };
