import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db/database.js';

describe('GET /api/health', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  afterAll(() => { db.close(); });

  it('returns healthy status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
