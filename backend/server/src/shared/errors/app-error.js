/**
 * AppError — a structured application error that carries an HTTP status code
 * and a short machine-readable code alongside the human-readable message.
 */
export class AppError extends Error {
  /**
   * @param {number} statusCode  HTTP status code, e.g. 400, 401, 403, 404, 409.
   * @param {string} message     Human-readable description.
   * @param {string} [code]      Machine-readable error code, e.g. 'VALIDATION_ERROR'.
   */
  constructor(statusCode, message, code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}
