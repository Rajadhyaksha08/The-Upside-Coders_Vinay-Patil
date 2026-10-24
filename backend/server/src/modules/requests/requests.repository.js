import { db } from '../../db/database.js';

// ── Prepared statements ──────────────────────────────────────────────────────

const insertRequest = db.prepare(`
  INSERT INTO service_requests
    (customer_id, service_category_id, title, description, budget, address, pincode, preferred_date, preferred_time)
  VALUES
    (@customer_id, @service_category_id, @title, @description, @budget, @address, @pincode, @preferred_date, @preferred_time)
`);

const BASE_SELECT = `
  SELECT
    sr.*,
    sc.name  AS service_name,
    sc.slug  AS service_slug,
    u.name   AS customer_name,
    wp_sel.user_id AS selected_worker_user_id
  FROM service_requests sr
  JOIN service_categories sc ON sc.id = sr.service_category_id
  JOIN users u ON u.id = sr.customer_id
  LEFT JOIN worker_profiles wp_sel ON wp_sel.id = sr.selected_worker_id
`;

function rowToRequest(row) {
  if (!row) return null;
  return {
    id:                row.id,
    customerId:        row.customer_id,
    customerName:      row.customer_name,
    serviceCategoryId: row.service_category_id,
    serviceName:       row.service_name,
    serviceSlug:       row.service_slug,
    title:             row.title,
    description:       row.description,
    budget:            row.budget,
    address:           row.address,
    pincode:           row.pincode,
    preferredDate:     row.preferred_date,
    preferredTime:     row.preferred_time,
    status:            row.status,
    selectedWorkerId:  row.selected_worker_id,
    createdAt:         row.created_at,
    updatedAt:         row.updated_at,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export function createRequest(data) {
  const result = insertRequest.run(data);
  return findRequestById(Number(result.lastInsertRowid));
}

export function findRequestById(id) {
  const row = db.prepare(`${BASE_SELECT} WHERE sr.id = ?`).get(id);
  return rowToRequest(row);
}

export function findRequestsByCustomer(customerId, { status, page, limit }) {
  const conditions = ['sr.customer_id = ?'];
  const params = [customerId];

  if (status) {
    conditions.push('sr.status = ?');
    params.push(status);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const offset = (page - 1) * limit;

  const rows = db.prepare(
    `${BASE_SELECT} ${whereClause} ORDER BY sr.created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  const countRow = db.prepare(
    `SELECT COUNT(*) AS total FROM service_requests sr ${whereClause}`
  ).get(...params);

  return {
    requests: rows.map(rowToRequest),
    total: countRow?.total ?? 0,
  };
}

export function updateRequest(id, fields) {
  const allowed = ['title', 'description', 'budget', 'address', 'pincode',
                   'preferred_date', 'preferred_time', 'status', 'selected_worker_id'];
  const setClauses = [];
  const values = [];

  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      setClauses.push(`${key} = ?`);
      values.push(val);
    }
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE service_requests SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
}

export function findServiceCategoryById(id) {
  return db.prepare('SELECT * FROM service_categories WHERE id = ?').get(id);
}

export function findWorkerProfileById(id) {
  return db.prepare('SELECT * FROM worker_profiles WHERE id = ? AND status = ?').get(id, 'active');
}

export const selectWorkerTransaction = db.transaction((requestId, workerId) => {
  updateRequest(requestId, { selected_worker_id: workerId, status: 'assigned' });
  return findRequestById(requestId);
});
