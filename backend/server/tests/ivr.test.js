import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createTestDb } from './helpers.js';

let app;

beforeAll(() => {
  const db = createTestDb();
  app = createApp(db);
});

describe('IVR API', () => {
  const SESSION_ID = 'test-session-001';
  const PHONE      = '9500000001';

  it('POST /api/ivr/sessions — creates a new IVR session', async () => {
    const res = await request(app).post('/api/ivr/sessions').send({
      sessionId:   SESSION_ID,
      callerPhone: PHONE,
    });
    expect(res.status).toBe(201);
    expect(res.body.session.state).toBe('welcome');
    expect(res.body.session.session_id).toBe(SESSION_ID);
  });

  it('POST /api/ivr/sessions/:id/event — pressing 1 advances to language', async () => {
    const res = await request(app).post(`/api/ivr/sessions/${SESSION_ID}/event`).send({ input: '1' });
    expect(res.status).toBe(200);
    expect(res.body.state).toBe('language');
    expect(res.body.message).toBeTruthy();
  });

  it('POST /api/ivr/sessions/:id/event — pressing 1 selects Hindi, goes to service_select', async () => {
    const res = await request(app).post(`/api/ivr/sessions/${SESSION_ID}/event`).send({ input: '1' });
    expect(res.status).toBe(200);
    expect(res.body.state).toBe('service_select');
  });

  it('POST /api/ivr/sessions/:id/event — pressing 1 selects electrician, goes to confirm', async () => {
    const res = await request(app).post(`/api/ivr/sessions/${SESSION_ID}/event`).send({ input: '1' });
    expect(res.status).toBe(200);
    expect(res.body.state).toBe('confirm');
  });

  it('POST /api/ivr/sessions/:id/event — pressing 1 confirms, goes to connect_worker', async () => {
    const res = await request(app).post(`/api/ivr/sessions/${SESSION_ID}/event`).send({ input: '1' });
    expect(res.status).toBe(200);
    expect(res.body.state).toBe('connect_worker');
  });

  it('GET /api/ivr/sessions/:id — returns session state', async () => {
    const res = await request(app).get(`/api/ivr/sessions/${SESSION_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.session.selected_service).toBe('electrician');
  });

  it('GET /api/ivr/sessions/:id — returns 404 for unknown session', async () => {
    const res = await request(app).get('/api/ivr/sessions/nonexistent-session');
    expect(res.status).toBe(404);
  });
});
