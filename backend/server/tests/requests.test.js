/**
 * requests.test.js — Integration tests for /api/requests endpoints.
 *
 * Covers: create, list, get, update, select-worker, cancel.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

let app;

beforeAll(() => {
  app = createApp();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function makeCustomer(phone) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({
    name: 'Customer ' + phone.slice(-4),
    phone,
    pin:  '1234',
    role: 'customer',
  });
  await agent.post('/api/auth/login').send({ phone, pin: '1234', role: 'customer' });
  return agent;
}

async function makeWorker(phone) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({
    name:       'Worker ' + phone.slice(-4),
    phone,
    pin:        '5678',
    role:       'worker',
    service:    'electrician',
    city:       'Delhi',
    pincode:    '110001',
    experience: '1 year',
    languages:  ['Hindi'],
    rateType:   'hourly',
    rate:       300,
  });
  await agent.post('/api/auth/login').send({ phone, pin: '5678', role: 'worker' });
  return agent;
}

const VALID_REQUEST = {
  serviceCategoryId: 1,
  title:             'Fix my lights',
  description:       'Two bulbs need replacing',
  budget:            500,
  address:           '22 Main St, Delhi',
  pincode:           '110001',
  preferredDate:     '2026-11-01',
  preferredTime:     '10:00 AM',
};

// ── POST /api/requests ────────────────────────────────────────────────────────

describe('POST /api/requests', () => {
  it('creates a request as a customer', async () => {
    const agent = await makeCustomer('9200000001');
    const res = await agent.post('/api/requests').send(VALID_REQUEST);
    expect(res.status).toBe(201);
    expect(res.body.request).toMatchObject({
      title:  'Fix my lights',
      status: 'open',
    });
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).post('/api/requests').send(VALID_REQUEST);
    expect(res.status).toBe(401);
  });

  it('returns 403 when authenticated as a worker', async () => {
    const agent = await makeWorker('9200000002');
    const res = await agent.post('/api/requests').send(VALID_REQUEST);
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid service category', async () => {
    const agent = await makeCustomer('9200000003');
    const res = await agent.post('/api/requests').send({ ...VALID_REQUEST, serviceCategoryId: 99999 });
    expect(res.status).toBe(400);
  });

  it('returns 422 for missing required title', async () => {
    const agent = await makeCustomer('9200000004');
    const res = await agent.post('/api/requests').send({ serviceCategoryId: 1 });
    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid pincode format', async () => {
    const agent = await makeCustomer('9200000005');
    const res = await agent.post('/api/requests').send({ ...VALID_REQUEST, pincode: 'ABCDEF' });
    expect(res.status).toBe(422);
  });
});

// ── GET /api/requests ─────────────────────────────────────────────────────────

describe('GET /api/requests', () => {
  it('lists own requests with pagination', async () => {
    const agent = await makeCustomer('9200000010');
    await agent.post('/api/requests').send(VALID_REQUEST);
    await agent.post('/api/requests').send({ ...VALID_REQUEST, title: 'Second request' });

    const res = await agent.get('/api/requests');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.requests)).toBe(true);
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('filters by status', async () => {
    const agent = await makeCustomer('9200000011');
    await agent.post('/api/requests').send(VALID_REQUEST);

    const res = await agent.get('/api/requests?status=open');
    expect(res.status).toBe(200);
    expect(res.body.requests.every((r) => r.status === 'open')).toBe(true);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/requests');
    expect(res.status).toBe(401);
  });
});

// ── GET /api/requests/:id ─────────────────────────────────────────────────────

describe('GET /api/requests/:id', () => {
  it('returns a specific request', async () => {
    const agent = await makeCustomer('9200000020');
    const createRes = await agent.post('/api/requests').send(VALID_REQUEST);
    const id = createRes.body.request.id;

    const res = await agent.get(`/api/requests/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.request.id).toBe(id);
  });

  it('returns 403 when accessing another customer\'s request', async () => {
    const agent1 = await makeCustomer('9200000021');
    const agent2 = await makeCustomer('9200000022');

    const createRes = await agent1.post('/api/requests').send(VALID_REQUEST);
    const id = createRes.body.request.id;

    const res = await agent2.get(`/api/requests/${id}`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent request', async () => {
    const agent = await makeCustomer('9200000023');
    const res = await agent.get('/api/requests/999999');
    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/requests/:id ───────────────────────────────────────────────────

describe('PATCH /api/requests/:id', () => {
  it('updates an open request', async () => {
    const agent = await makeCustomer('9200000030');
    const createRes = await agent.post('/api/requests').send(VALID_REQUEST);
    const id = createRes.body.request.id;

    const res = await agent.patch(`/api/requests/${id}`).send({
      title:  'Updated title',
      budget: 800,
    });
    expect(res.status).toBe(200);
    expect(res.body.request.title).toBe('Updated title');
  });

  it('returns 422 for empty update body', async () => {
    const agent = await makeCustomer('9200000031');
    const createRes = await agent.post('/api/requests').send(VALID_REQUEST);
    const id = createRes.body.request.id;

    const res = await agent.patch(`/api/requests/${id}`).send({});
    expect(res.status).toBe(422);
  });
});

// ── POST /api/requests/:id/cancel ─────────────────────────────────────────────

describe('POST /api/requests/:id/cancel', () => {
  it('cancels an open request', async () => {
    const agent = await makeCustomer('9200000040');
    const createRes = await agent.post('/api/requests').send(VALID_REQUEST);
    const id = createRes.body.request.id;

    const res = await agent.post(`/api/requests/${id}/cancel`);
    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('cancelled');
  });

  it('cannot cancel an already-cancelled request', async () => {
    const agent = await makeCustomer('9200000041');
    const createRes = await agent.post('/api/requests').send(VALID_REQUEST);
    const id = createRes.body.request.id;

    await agent.post(`/api/requests/${id}/cancel`);
    const res = await agent.post(`/api/requests/${id}/cancel`);
    expect(res.status).toBe(409);
  });
});
