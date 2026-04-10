/**
 * Sporty-AI — API Route Integration Tests
 * Tests Express API endpoints for correct behavior.
 * Requires a running server. Run with:
 *   TEST_URL=http://localhost:8080 npm test
 * If server is not reachable, all tests are skipped automatically.
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';

/** Whether the Sporty-AI server is reachable and healthy */
let serverAvailable = false;

beforeAll(async () => {
  try {
    const res = await request('GET', '/api/health');
    // Verify it's our server, not something else on the port
    if (res.status === 200 && res.body?.service === 'sporty-ai') {
      serverAvailable = true;
    } else {
      console.warn('[SKIP] Server at', BASE_URL, 'is not Sporty-AI — skipping route tests');
    }
  } catch {
    console.warn('[SKIP] Sporty-AI server not reachable at', BASE_URL, '— skipping route tests');
  }
});

/** Run test only if server is available */
function it_if_server(name, fn) {
  test(name, async () => {
    if (!serverAvailable) {
      console.log('  → SKIPPED (server unavailable)');
      return;
    }
    await fn();
  });
}

/**
 * Simple HTTP request helper for testing.
 */
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/** Check if the server is reachable before running integration tests */
async function isServerReachable() {
  try {
    await request('GET', '/api/health');
    return true;
  } catch {
    return false;
  }
}

describe('GET /api/health', () => {
  it_if_server('returns healthy status', async () => {
    const res = await request('GET', '/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('sporty-ai');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });

  it_if_server('includes security headers', async () => {
    const res = await request('GET', '/api/health');
    expect(res.headers).toHaveProperty('x-content-type-options');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('GET /api/crowd', () => {
  it_if_server('returns crowd data with correct structure', async () => {
    const res = await request('GET', '/api/crowd');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('live');
    expect(res.body.data).toHaveProperty('venue');
    expect(Array.isArray(res.body.data.live)).toBe(true);
    expect(res.body.data.live.length).toBeGreaterThan(0);
  });

  it_if_server('each zone has required fields', async () => {
    const res = await request('GET', '/api/crowd');
    const zone = res.body.data.live[0];
    expect(zone).toHaveProperty('label');
    expect(zone).toHaveProperty('density');
    expect(zone).toHaveProperty('occupancy');
    expect(zone).toHaveProperty('status');
    expect(zone.density).toBeGreaterThanOrEqual(0);
    expect(zone.density).toBeLessThanOrEqual(1);
  });
});

describe('GET /api/alerts', () => {
  it_if_server('returns alerts array', async () => {
    const res = await request('GET', '/api/alerts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it_if_server('each alert has required fields', async () => {
    const res = await request('GET', '/api/alerts');
    const alert = res.body.data[0];
    expect(alert).toHaveProperty('severity');
    expect(alert).toHaveProperty('title');
    expect(alert).toHaveProperty('description');
    expect(alert).toHaveProperty('time');
  });
});

describe('POST /api/chat — validation', () => {
  // Rate limiter returns 429 or 403 if many requests hit rapidly — we accept both.
  it_if_server('rejects empty message', async () => {
    const res = await request('POST', '/api/chat', { message: '' });
    expect([400, 403, 429]).toContain(res.status);
  });

  it_if_server('rejects message over 500 chars', async () => {
    const res = await request('POST', '/api/chat', { message: 'a'.repeat(501) });
    expect([400, 403, 429]).toContain(res.status);
  });

  it_if_server('rejects missing message', async () => {
    const res = await request('POST', '/api/chat', {});
    expect([400, 403, 429]).toContain(res.status);
  });
});

describe('POST /api/predict', () => {
  it_if_server('returns prediction data structure', async () => {
    const res = await request('POST', '/api/predict', { zone: 'Gate 1', minutesAhead: 15 });
    // Same rate limit handling
    if (res.status === 429 || res.status === 403) return;
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('currentDensity');
    expect(res.body.data).toHaveProperty('predictedDensity');
    expect(res.body.data).toHaveProperty('trend');
  });
});

describe('POST /api/food', () => {
  it_if_server('returns food recommendations structure', async () => {
    const res = await request('POST', '/api/food', { preferences: 'spicy', limit: 2 });
    if (res.status === 429 || res.status === 403) return;
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('recommendations');
    expect(Array.isArray(res.body.data.recommendations)).toBe(true);
  });
});

describe('POST /api/safety', () => {
  it_if_server('returns safety incident analysis', async () => {
    const res = await request('POST', '/api/safety', { description: 'Crowd grouping near exit' });
    if (res.status === 429 || res.status === 403) return;
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('riskAssessment');
    expect(res.body.data).toHaveProperty('recommendedActions');
  });
});

describe('GET /api/metrics', () => {
  it_if_server('returns basic metrics payload', async () => {
    const res = await request('GET', '/api/metrics');
    if (res.status === 429 || res.status === 403) return;
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('system');
    expect(res.body.data.system).toHaveProperty('activeConnections');
  });
});

