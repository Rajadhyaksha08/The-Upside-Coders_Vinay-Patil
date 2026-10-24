import { Router } from 'express';
import { db } from '../../db/database.js';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  // A lightweight DB read verifies both process and SQLite availability.
  db.prepare('SELECT 1 AS ok').get();
  res.json({ status: 'ok', service: 'kaamconnect-api' });
});
