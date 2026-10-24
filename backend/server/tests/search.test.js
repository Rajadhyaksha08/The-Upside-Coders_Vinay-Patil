import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createTestDb } from './helpers.js';

let app, agent;

beforeAll(async () => {
  const db = createTestDb();
  app = createApp(db);

  // Register 3 workers with different services/cities
  for (const w of [
    { name: 'Electrician Delhi', phone: '9400000001', pin: '1111', service: 'electrician', city: 'Delhi', pincode: '110001', rateType: 'hourly', rate: 300 },
    { name: 'Plumber Mumbai',    phone: '9400000002', pin: '2222', service: 'plumber',      city: 'Mumbai', pincode: '400001', rateType: 'hourly', rate: 400 },
    { name: 'Carpenter Delhi',   phone: '9400000003', pin: '3333', service: 'carpenter',    city: 'Delhi', pincode: '110002', rateType: 'fixed',  rate: 500 },
  ]) {
    await request(app).post('/api/auth/register').send({
      role: 'worker', experience: '2 years', languages: ['Hindi'],
      ...w
    });
    // Set availability to available
    const wAgent = request.agent(app);
    await wAgent.post('/api/auth/login').send({ phone: w.phone, pin: w.pin, role: 'worker' });
    await wAgent.patch('/api/workers/me/availability').send({ status: 'available' });
  }

  agent = request.agent(app);
});

describe('GET /api/search/workers', () => {
  it('returns all workers without filters', async () => {
    const res = await request(app).get('/api/search/workers');
    expect(res.status).toBe(200);
    expect(res.body.workers.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('total');
  });

  it('filters by service slug', async () => {
    const res = await request(app).get('/api/search/workers?service=electrician');
    expect(res.status).toBe(200);
    expect(res.body.workers.length).toBeGreaterThan(0);
    res.body.workers.forEach(w => {
      expect(w.service_slugs).toContain('electrician');
    });
  });

  it('filters by city', async () => {
    const res = await request(app).get('/api/search/workers?city=Delhi');
    expect(res.status).toBe(200);
    res.body.workers.forEach(w => expect(w.city).toContain('Delhi'));
  });

  it('filters by availability=available', async () => {
    const res = await request(app).get('/api/search/workers?availability=available');
    expect(res.status).toBe(200);
    res.body.workers.forEach(w => expect(w.availability).toBe('available'));
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/api/search/workers?sortBy=price');
    expect(res.status).toBe(200);
    const rates = res.body.workers.map(w => w.hourly_rate ?? w.fixed_rate ?? 9999);
    for (let i = 1; i < rates.length; i++) {
      expect(rates[i]).toBeGreaterThanOrEqual(rates[i - 1]);
    }
  });

  it('returns empty array for no matches', async () => {
    const res = await request(app).get('/api/search/workers?city=Atlantis');
    expect(res.status).toBe(200);
    expect(res.body.workers).toEqual([]);
  });

  it('returns 422 for invalid query params', async () => {
    const res = await request(app).get('/api/search/workers?minRating=10');
    expect(res.status).toBe(422);
  });
});
