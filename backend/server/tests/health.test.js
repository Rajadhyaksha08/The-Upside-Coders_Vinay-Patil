import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

// NOTE: Do NOT call db.close() here — the db singleton is shared across all test
// files in the same process. Closing it breaks subsequent test suites.

let app;

beforeAll(() => {
  app = createApp();
});

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns service name in response', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('service');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});
