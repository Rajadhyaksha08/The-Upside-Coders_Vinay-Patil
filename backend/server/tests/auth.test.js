/**
 * auth.test.js — Integration tests for /api/auth endpoints.
 *
 * Covers: register, login, /me, logout.
 * Uses a fresh supertest agent per describe block for cookie isolation.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

let app;

beforeAll(() => {
  app = createApp();
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const CUSTOMER = {
  name:     'Priya Sharma',
  phone:    '9000100001',
  pin:      '1234',
  role:     'customer',
};

const WORKER = {
  name:      'Raj Kumar',
  phone:     '9000200001',
  pin:       '5678',
  role:      'worker',
  service:   'electrician',
  city:      'Delhi',
  pincode:   '110001',
  experience:'2 years',
  languages: ['Hindi'],
  rateType:  'hourly',
  rate:      400,
};

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('registers a new customer successfully', async () => {
    const agent = request.agent(app);
    const res = await agent.post('/api/auth/register').send(CUSTOMER);
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: 'customer', name: 'Priya Sharma' });
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('registers a new worker successfully', async () => {
    const agent = request.agent(app);
    const res = await agent.post('/api/auth/register').send(WORKER);
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ role: 'worker' });
    expect(res.body.user.workerProfileId).toBeTruthy();
  });

  it('rejects duplicate phone number', async () => {
    const agent = request.agent(app);
    // Register once
    await agent.post('/api/auth/register').send({ ...CUSTOMER, phone: '9000100001' });
    // Try to register same phone again
    const res = await agent.post('/api/auth/register').send({ ...CUSTOMER, phone: '9000100001' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_PHONE');
  });

  it('rejects missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'X' });
    expect(res.status).toBe(422);
  });

  it('rejects invalid role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      ...CUSTOMER,
      phone: '9000100099',
      role: 'superadmin',
    });
    expect(res.status).toBe(422);
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      ...CUSTOMER, phone: '9000100002',
    });
    const res = await agent.post('/api/auth/login').send({
      phone: '9000100002', pin: '1234', role: 'customer',
    });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ role: 'customer' });
  });

  it('rejects wrong PIN', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({
      ...CUSTOMER, phone: '9000100003',
    });
    const res = await agent.post('/api/auth/login').send({
      phone: '9000100003', pin: '9999', role: 'customer',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects unknown phone number', async () => {
    const res = await request(app).post('/api/auth/login').send({
      phone: '9999999999', pin: '1111', role: 'customer',
    });
    expect(res.status).toBe(401);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ phone: '9000100001' });
    expect(res.status).toBe(422);
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('returns user data when authenticated', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({ ...CUSTOMER, phone: '9000100004' });
    await agent.post('/api/auth/login').send({ phone: '9000100004', pin: '1234', role: 'customer' });
    const res = await agent.get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ role: 'customer' });
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('logs out and invalidates session', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/register').send({ ...CUSTOMER, phone: '9000100005' });
    await agent.post('/api/auth/login').send({ phone: '9000100005', pin: '1234', role: 'customer' });

    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);

    // Session should be gone — /me should return 401
    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(401);
  });
});
