/**
 * Sporty-AI — API Route Tests
 * Tests Express API endpoints for correct behavior.
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:8080';

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

describe('GET /api/health', () => {
  test('returns healthy status', async () => {
    const res = await request('GET', '/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('sporty-ai');
    expect(res.body.version).toBe('1.0.0');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });

  test('includes security headers', async () => {
    const res = await request('GET', '/api/health');
    expect(res.headers).toHaveProperty('x-content-type-options');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('GET /api/crowd', () => {
  test('returns crowd data with correct structure', async () => {
    const res = await request('GET', '/api/crowd');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('live');
    expect(res.body.data).toHaveProperty('venue');
    expect(Array.isArray(res.body.data.live)).toBe(true);
    expect(res.body.data.live.length).toBe(16);
  });

  test('each zone has required fields', async () => {
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
  test('returns alerts array', async () => {
    const res = await request('GET', '/api/alerts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('each alert has required fields', async () => {
    const res = await request('GET', '/api/alerts');
    const alert = res.body.data[0];
    expect(alert).toHaveProperty('severity');
    expect(alert).toHaveProperty('title');
    expect(alert).toHaveProperty('description');
    expect(alert).toHaveProperty('time');
  });
});

describe('POST /api/chat — validation', () => {
  test('rejects empty message', async () => {
    const res = await request('POST', '/api/chat', { message: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('rejects message over 500 chars', async () => {
    const res = await request('POST', '/api/chat', { message: 'a'.repeat(501) });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('500');
  });

  test('rejects missing message', async () => {
    const res = await request('POST', '/api/chat', {});
    expect(res.status).toBe(400);
  });
});
