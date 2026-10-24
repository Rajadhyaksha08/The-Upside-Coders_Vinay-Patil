import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createTestDb } from './helpers.js';

let app, db, agent;

// Shared actors
let customer1, worker1;
let workerProfileId;
let requestId, bookingId;

const CUSTOMER_PHONE  = '9300000001';
const WORKER_PHONE    = '9300000002';
const PIN             = '4321';

async function loginAs(agent, phone, role) {
  return agent.post('/api/auth/login').send({ phone, pin: PIN, role });
}

beforeAll(async () => {
  db  = createTestDb();
  app = createApp(db);

  // Register customer
  const custAgent = request.agent(app);
  await custAgent.post('/api/auth/register').send({
    name: 'Book Customer', phone: CUSTOMER_PHONE, pin: PIN, role: 'customer',
  });

  // Register worker
  const wkAgent = request.agent(app);
  await wkAgent.post('/api/auth/register').send({
    name: 'Book Worker', phone: WORKER_PHONE, pin: PIN, role: 'worker',
    service: 'electrician', city: 'Delhi', pincode: '110001',
    experience: '3 years', languages: ['Hindi'], rateType: 'hourly', rate: 350,
  });

  // Get worker profile id
  await loginAs(wkAgent, WORKER_PHONE, 'worker');
  const wpRes = await wkAgent.get('/api/workers/me');
  workerProfileId = wpRes.body.worker?.id;

  // Log in as customer
  agent = request.agent(app);
  await loginAs(agent, CUSTOMER_PHONE, 'customer');

  // Create a service request
  const srRes = await agent.post('/api/requests').send({
    serviceCategoryId: 1, title: 'Fix my fan', address: '5 Main St', pincode: '110001',
  });
  requestId = srRes.body.request?.id;
});

describe('POST /api/bookings', () => {
  it('creates a booking from an existing service request', async () => {
    const res = await agent.post('/api/bookings').send({
      serviceRequestId: requestId,
      workerId:         workerProfileId,
    });
    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({ status: 'pending' });
    bookingId = res.body.booking.id;
  });

  it('returns 409 for duplicate booking on same request', async () => {
    const res = await agent.post('/api/bookings').send({
      serviceRequestId: requestId,
      workerId:         workerProfileId,
    });
    expect(res.status).toBe(409);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).post('/api/bookings').send({
      serviceRequestId: requestId, workerId: workerProfileId,
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/bookings', () => {
  it('lists bookings for authenticated user', async () => {
    const res = await agent.get('/api/bookings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThan(0);
  });
});

describe('GET /api/bookings/:id', () => {
  it('returns booking detail', async () => {
    const res = await agent.get(`/api/bookings/${bookingId}`);
    expect(res.status).toBe(200);
    expect(res.body.booking.id).toBe(bookingId);
  });

  it('returns 404 for non-existent booking', async () => {
    const res = await agent.get('/api/bookings/99999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/bookings/:id/status (worker)', () => {
  it('worker can accept a pending booking', async () => {
    const wkAgent = request.agent(app);
    await loginAs(wkAgent, WORKER_PHONE, 'worker');
    const res = await wkAgent.patch(`/api/bookings/${bookingId}/status`).send({ status: 'accepted' });
    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('accepted');
  });

  it('rejects invalid state transition', async () => {
    const wkAgent = request.agent(app);
    await loginAs(wkAgent, WORKER_PHONE, 'worker');
    // Can't go from accepted → completed directly
    const res = await wkAgent.patch(`/api/bookings/${bookingId}/status`).send({ status: 'completed' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/bookings/:id/cancel', () => {
  it('customer can cancel a booking', async () => {
    // Create a new booking to cancel
    const srRes = await agent.post('/api/requests').send({
      serviceCategoryId: 1, title: 'Cancel Test', address: '9 Test Rd', pincode: '110001',
    });
    const newRequestId = srRes.body.request?.id;
    const bRes = await agent.post('/api/bookings').send({
      serviceRequestId: newRequestId, workerId: workerProfileId,
    });
    const newBookingId = bRes.body.booking?.id;

    const res = await agent.post(`/api/bookings/${newBookingId}/cancel`).send({ reason: 'Changed my mind' });
    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('cancelled');
  });
});

describe('GET /api/bookings/:id/history', () => {
  it('returns status history', async () => {
    const res = await agent.get(`/api/bookings/${bookingId}/history`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
  });
});
