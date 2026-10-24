/**
 * validateRequest — Zod-powered request validation middleware factory.
 *
 * Usage:
 *   router.post('/route', validateRequest({ body: mySchema }), handler);
 *
 * Validated data is attached to req.validated so handlers don't touch raw
 * req.body directly.
 */
export function validateRequest({ body, query, params } = {}) {
  return (req, res, next) => {
    try {
      req.validated = {};

      if (body) {
        req.validated.body = body.parse(req.body);
      }
      if (query) {
        req.validated.query = query.parse(req.query);
      }
      if (params) {
        req.validated.params = params.parse(req.params);
      }

      next();
    } catch (err) {
      // Forward ZodError to the central error handler
      next(err);
    }
  };
}
