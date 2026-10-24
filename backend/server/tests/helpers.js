/**
 * helpers.js — shared test utilities.
 *
 * Creates an in-memory SQLite database, runs the full schema,
 * seeds minimal service_categories, and returns an app instance
 * and a supertest agent that persists cookies across calls.
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { createApp } from '../src/app.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../../database/schema.sql');

/**
 * Create a fresh isolated in-memory database with the full schema.
 */
export function createTestDb() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  // Seed minimal service categories for tests
  db.prepare(`
    INSERT OR IGNORE INTO service_categories (name, slug, service_type, icon)
    VALUES
      ('Electrician',  'electrician',  'temporary', '⚡'),
      ('Plumber',      'plumber',      'temporary', '🔧'),
      ('Carpenter',    'carpenter',    'temporary', '🪵'),
      ('House Cleaner','house-cleaner','temporary', '🧹')
  `).run();

  return db;
}

/**
 * Create a test app + supertest agent (persists cookies) backed by a fresh in-memory DB.
 * Returns { app, agent, db }.
 */
export function createTestApp() {
  const db = createTestDb();
  const app = createApp(db);
  const agent = request.agent(app); // cookie jar
  return { app, agent, db };
}

/**
 * Register + login a user and return the authed agent + user data.
 */
export async function registerAndLogin(agent, overrides = {}) {
  const payload = {
    name:     'Test User',
    phone:    '9876543210',
    password: 'Password@123',
    role:     'customer',
    ...overrides,
  };

  await agent.post('/api/auth/register').send(payload);
  const loginRes = await agent.post('/api/auth/login').send({
    phone:    payload.phone,
    password: payload.password,
    role:     payload.role,
  });

  return { user: loginRes.body.user, payload };
}

/**
 * Register + login a worker and return the authed agent + user data.
 */
export async function registerAndLoginWorker(agent, overrides = {}) {
  return registerAndLogin(agent, {
    name:  'Test Worker',
    phone: '9123456789',
    role:  'worker',
    workerData: {
      city:              'Delhi',
      pincode:           '110001',
      experience:        '3 years',
      languages:         ['Hindi', 'English'],
      rateType:          'hourly',
      rate:              350,
      serviceCategoryId: 1,
    },
    ...overrides,
  });
}
