import crypto from 'node:crypto';

/**
 * Generate a cryptographically random numeric OTP.
 * @param {number} [length=6]  Number of digits.
 * @returns {{ code: string, expiresAt: Date }}
 */
export function generateOtp(length = 6) {
  // Generate a random integer with `length` digits
  const max = 10 ** length;
  const min = 10 ** (length - 1);
  const num = crypto.randomInt(min, max);
  const code = String(num);

  // OTP expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return { code, expiresAt };
}
