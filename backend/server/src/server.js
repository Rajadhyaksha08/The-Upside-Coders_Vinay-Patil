import { createApp } from './app.js';
import { env } from './config/env.js';
import { db } from './db/database.js';

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`KaamConnect API listening on port ${env.PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
