import { db } from './database.js';

const insert = db.prepare(`
  INSERT OR IGNORE INTO service_categories (name, service_type)
  VALUES (?, ?)
`);
const seed = db.transaction(() => {
  for (const [name, type] of [
    ['Electrician', 'temporary'],
    ['Plumber', 'temporary'],
    ['Carpenter', 'temporary'],
    ['Painter', 'temporary'],
    ['Cook', 'tenure'],
    ['House cleaning', 'tenure'],
    ['Babysitter', 'tenure']
  ]) insert.run(name, type);
});
seed();
console.log('Seed data inserted.');
db.close();
