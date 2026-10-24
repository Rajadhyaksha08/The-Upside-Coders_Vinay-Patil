/**
 * asyncHandler — wraps an async Express route handler so that any rejected
 * promise is forwarded to the next() error handler instead of causing an
 * unhandled promise rejection.
 *
 * Compatible with Express 4 and 5.
 *
 * @param {Function} fn  Async (req, res, next) → Promise
 * @returns {Function}   Express route handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
