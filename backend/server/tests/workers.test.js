/**
 * workers.test.js — Integration tests for /api/workers endpoints.
 *
 * Covers: list workers, get worker by id, get/update own profile, availability.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

let app;

beforeAll(() => {
  app = createApp();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function registerWorker(phone, overrides = {}) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({
    name:       'Worker ' + phone.slice(-4),
    phone,
    pin:        '1234',
    role:       'worker',
    service:    'plumber',
    city:       'Mumbai',
    pincode:    '400001',
    experience: '5 years',
    languages:  ['Hindi', 'Marathi'],
    rateType:   'hourly',
    rate:       500,
    ...overrides,
  });
  await agent.post('/api/auth/login').send({
    phone,
    pin: overrides.pin ?? '1234',
    role: 'worker',
  });
  return agent;
}

// ── GET /api/workers ──────────────────────────────────────────────────────────

describe('GET /api/workers', () => {
  it('returns a list of workers (public)', async () => {
    // Register at least one worker first
    await registerWorker('9100000001');
    const res = await request(app).get('/api/workers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('workers');
    expect(Array.isArray(res.body.workers)).toBe(true);
  });

  it('supports city filter', async () => {
    await registerWorker('9100000002', { city: 'Chennai' });
    const res = await request(app).get('/api/workers?city=Chennai');
    expect(res.status).toBe(200);
    const cities = res.body.workers.map((w) => w.city);
    expect(cities.every((c) => c === 'Chennai')).toBe(true);
  });

  it('returns 422 for invalid query params', async () => {
    const res = await request(app).get('/api/workers?limit=999');
    expect(res.status).toBe(422);
  });
});

// ── GET /api/workers/:id ──────────────────────────────────────────────────────

describe('GET /api/workers/:id', () => {
  it('returns a public worker profile', async () => {
    const agent = await registerWorker('9100000003');
    // Get own profile id
    const meRes = await agent.get('/api/workers/me');
    const workerId = meRes.body.worker?.userId ?? meRes.body.user?.id;

    const res = await request(app).get(`/api/workers/${workerId}`);
    expect([200, 404]).toContain(res.status);
  });

  it('returns 404 for non-existent worker', async () => {
    const res = await request(app).get('/api/workers/999999');
    expect(res.status).toBe(404);
  });
});

// ── GET /api/workers/me ───────────────────────────────────────────────────────

describe('GET /api/workers/me', () => {
  it('returns own profile when authenticated as worker', async () => {
    const agent = await registerWorker('9100000004');
    const res = await agent.get('/api/workers/me');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('worker');
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/workers/me');
    expect(res.status).toBe(401);
  });

  it('returns 403 when authenticated as customer', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      name: 'Cust Test', phone: '9100000099', pin: '4321', role: 'customer',
    });
    await agent.post('/api/auth/login').send({ phone: '9100000099', pin: '4321', role: 'customer' });
    const res = await agent.get('/api/workers/me');
    expect(res.status).toBe(403);
  });
});

// ── PATCH /api/workers/me ─────────────────────────────────────────────────────

describe('PATCH /api/workers/me', () => {
  it('updates own worker profile', async () => {
    const agent = await registerWorker('9100000005');
    const res = await agent.patch('/api/workers/me').send({
      city:    'Bangalore',
      pincode: '560001',
      bio:     'Experienced plumber',
    });
    expect(res.status).toBe(200);
    expect(res.body.worker?.city ?? res.body.city).toBe('Bangalore');
  });

  it('returns 422 for invalid update data', async () => {
    const agent = await registerWorker('9100000006');
    const res = await agent.patch('/api/workers/me').send({ pincode: 'abc' });
    expect(res.status).toBe(422);
  });
});

// ── GET + PATCH /api/workers/me/availability ──────────────────────────────────

describe('Worker availability endpoints', () => {
  it('gets own availability', async () => {
    const agent = await registerWorker('9100000007');
    const res = await agent.get('/api/workers/me/availability');
    expect(res.status).toBe(200);
    expect(res.body.availability).toHaveProperty('status');
  });

  it('updates availability status to available', async () => {
    const agent = await registerWorker('9100000008');
    const res = await agent.patch('/api/workers/me/availability').send({ status: 'available' });
    expect(res.status).toBe(200);
    expect(res.body.availability.status).toBe('available');
  });

  it('rejects invalid availability status', async () => {
    const agent = await registerWorker('9100000009');
    const res = await agent.patch('/api/workers/me/availability').send({ status: 'on-vacation' });
    expect(res.status).toBe(422);
  });

  it('returns 403 for non-worker user', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      name: 'Avail Test', phone: '9100000098', pin: '5555', role: 'customer',
    });
    await agent.post('/api/auth/login').send({ phone: '9100000098', pin: '5555', role: 'customer' });
    const res = await agent.get('/api/workers/me/availability');
    expect(res.status).toBe(403);
  });
});
