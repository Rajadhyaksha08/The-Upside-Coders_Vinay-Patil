/**
 * 404 handler — registered after all routes so it only fires when no route
 * matched.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` },
  });
}
