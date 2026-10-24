/**
 * seed.js — idempotent seed of reference data.
 *
 * Service category slugs match the ids used by the frontend SERVICES array
 * so that worker registration and filtering are consistent.
 *
 * Usage: node server/src/db/seed.js
 * Safe to run multiple times — uses INSERT OR IGNORE.
 */

import { db } from './database.js';

const CATEGORIES = [
  { name: 'Electrician',    slug: 'electrician',  service_type: 'temporary', icon: '⚡' },
  { name: 'Plumber',        slug: 'plumber',       service_type: 'temporary', icon: '🔧' },
  { name: 'Carpenter',      slug: 'carpenter',     service_type: 'temporary', icon: '🪚' },
  { name: 'Painter',        slug: 'painter',       service_type: 'temporary', icon: '🖌️' },
  { name: 'Cook',           slug: 'cook',          service_type: 'tenure',    icon: '👨‍🍳' },
  { name: 'Cleaner',        slug: 'cleaner',       service_type: 'tenure',    icon: '🧹' },
  { name: 'Babysitter',     slug: 'babysitter',    service_type: 'tenure',    icon: '👶' },
  { name: 'AC Repair',      slug: 'ac_repair',     service_type: 'temporary', icon: '❄️' },
  { name: 'Driver',         slug: 'driver',        service_type: 'tenure',    icon: '🚗' },
  { name: 'Security Guard', slug: 'security',      service_type: 'tenure',    icon: '💂' },
  { name: 'Gardener',       slug: 'gardener',      service_type: 'tenure',    icon: '🌿' },
  { name: 'Pest Control',   slug: 'pest_control',  service_type: 'temporary', icon: '🐛' },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO service_categories (name, slug, service_type, icon)
  VALUES (@name, @slug, @service_type, @icon)
`);

const seedAll = db.transaction(() => {
  for (const cat of CATEGORIES) {
    insert.run(cat);
  }
});

seedAll();
console.log(`✅  Seeded ${CATEGORIES.length} service categories (duplicates skipped).`);
db.close();
