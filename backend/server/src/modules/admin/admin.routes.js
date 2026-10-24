import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { z } from 'zod';
import { db } from '../../db/database.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { listAllBookings } from '../bookings/bookings.repository.js';

export const adminRouter = Router();

// All admin routes require authentication + admin role
adminRouter.use(requireAuth, requireRole('admin'));

const paginationSchema = z.object({
  page:  z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.string().optional(),
});

// ── Stats overview ───────────────────────────────────────────────────────────
adminRouter.get('/stats', asyncHandler(async (_req, res) => {
  const totalWorkers   = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='worker' AND status='active'").get().n;
  const totalCustomers = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='customer' AND status='active'").get().n;
  const totalBookings  = db.prepare("SELECT COUNT(*) AS n FROM bookings").get().n;
  const openBookings   = db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE status NOT IN ('completed','cancelled')").get().n;
  const totalRequests  = db.prepare("SELECT COUNT(*) AS n FROM service_requests").get().n;
  const openDisputes   = db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE status='disputed'").get().n;
  const avgRating      = db.prepare("SELECT ROUND(AVG(rating),1) AS avg FROM worker_profiles WHERE review_count > 0").get().avg;

  res.json({
    totalWorkers, totalCustomers, totalBookings,
    openBookings, totalRequests, openDisputes,
    avgRating: avgRating ?? 0,
  });
}));

// ── Users ────────────────────────────────────────────────────────────────────
adminRouter.get('/users', validateRequest({ query: paginationSchema }), asyncHandler(async (req, res) => {
  const { page, limit, status } = req.validated.query;
  const offset = (page - 1) * limit;

  let where = '';
  const params = [];
  if (status) { where = 'WHERE status = ?'; params.push(status); }

  const total = db.prepare(`SELECT COUNT(*) AS n FROM users ${where}`).get(...params).n;
  const users = db.prepare(`
    SELECT id, name, phone, role, status, created_at
    FROM users ${where}
    ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({ users, total, page, limit });
}));

// PATCH /admin/users/:id/status — suspend or reactivate
adminRouter.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: { code: 'INVALID_STATUS', message: 'Status must be active or suspended.' } });
  }
  db.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
  const user = db.prepare('SELECT id, name, phone, role, status FROM users WHERE id = ?').get(req.params.id);
  res.json({ user });
}));

// ── Workers ──────────────────────────────────────────────────────────────────
adminRouter.get('/workers', validateRequest({ query: paginationSchema }), asyncHandler(async (req, res) => {
  const { page, limit, status } = req.validated.query;
  const offset = (page - 1) * limit;

  let where = status ? 'WHERE wp.status = ?' : '';
  const params = status ? [status] : [];

  const total = db.prepare(`SELECT COUNT(*) AS n FROM worker_profiles wp ${where}`).get(...params).n;
  const workers = db.prepare(`
    SELECT wp.*, u.name, u.phone, u.status AS user_status,
           COALESCE(wa.status, 'offline') AS availability
    FROM worker_profiles wp
    JOIN users u ON u.id = wp.user_id
    LEFT JOIN worker_availability wa ON wa.worker_profile_id = wp.id
    ${where}
    ORDER BY wp.created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  res.json({ workers, total, page, limit });
}));

// PATCH /admin/workers/:id/verify — platform verification
adminRouter.patch('/workers/:id/verify', asyncHandler(async (req, res) => {
  const { verified } = req.body;
  db.prepare(`
    UPDATE worker_profiles SET platform_verified = ?, updated_at = datetime('now') WHERE id = ?
  `).run(verified ? 1 : 0, req.params.id);
  res.json({ success: true });
}));

// ── Bookings ─────────────────────────────────────────────────────────────────
adminRouter.get('/bookings', validateRequest({ query: paginationSchema }), asyncHandler(async (req, res) => {
  const result = listAllBookings(req.validated.query);
  res.json(result);
}));

// PATCH /admin/bookings/:id/dispute — admin resolves dispute
adminRouter.patch('/bookings/:id/dispute', asyncHandler(async (req, res) => {
  const { resolution, status } = req.body; // status: completed | cancelled
  if (!['completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: { code: 'INVALID_STATUS', message: 'Dispute resolution must set status to completed or cancelled.' } });
  }
  db.prepare(`
    UPDATE bookings SET status = ?, cancellation_reason = ?, updated_at = datetime('now')
    WHERE id = ? AND status = 'disputed'
  `).run(status, resolution ?? null, req.params.id);
  res.json({ success: true });
}));

// ── Service categories ────────────────────────────────────────────────────────
adminRouter.get('/service-categories', asyncHandler(async (_req, res) => {
  const categories = db.prepare('SELECT * FROM service_categories ORDER BY name').all();
  res.json({ categories });
}));
