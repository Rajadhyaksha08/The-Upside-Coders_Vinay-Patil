import argon2 from 'argon2';
import { AppError } from '../../shared/errors/app-error.js';
import {
  findUserByPhone,
  findUserById,
  findServiceCategoryBySlug,
  createUserWithProfile,
} from './auth.repository.js';

/** Normalize a phone number: strip non-digits and leading country code */
export function normalizePhone(raw) {
  const digits = String(raw).replace(/\D/g, '');
  // Strip leading 91 if present (India country code) and number is 12 digits
  return digits.length === 12 && digits.startsWith('91')
    ? digits.slice(2)
    : digits;
}

/**
 * Build the safe public user object returned by API responses.
 * Never includes password_hash.
 */
export function publicUser(user, workerProfileId = null) {
  return {
    id:          user.id,
    name:        user.name,
    role:        user.role,
    status:      user.status,
    workerProfileId,
    createdAt:   user.created_at,
  };
}

// ── Register ─────────────────────────────────────────────────────────────────

export async function registerUser(data) {
  const phone = normalizePhone(data.phone);

  // Check for duplicate account
  const existing = findUserByPhone(phone);
  if (existing) {
    throw new AppError(409, 'An account with this mobile number already exists.', 'DUPLICATE_PHONE');
  }

  // Validate service slug for workers
  let serviceCategoryId = null;
  if (data.role === 'worker' && data.service) {
    const cat = findServiceCategoryBySlug(data.service.toLowerCase());
    if (!cat) {
      throw new AppError(400, `Unknown service category: ${data.service}`, 'INVALID_SERVICE');
    }
    serviceCategoryId = cat.id;
  }

  const password_hash = await argon2.hash(data.pin);

  const { userId, workerProfileId } = createUserWithProfile({
    name:          data.name.trim(),
    phone,
    password_hash,
    role:          data.role,
    workerData:    data.role === 'worker' ? {
      city:              data.city?.trim() ?? '',
      pincode:           data.pincode ?? '',
      experience:        data.experience ?? null,
      languages:         data.languages ?? [],
      rateType:          data.rateType ?? 'hourly',
      rate:              data.rate ?? null,
      bio:               data.bio ?? null,
      serviceCategoryId,
    } : null,
  });

  const user = findUserById(userId);
  return publicUser(user, workerProfileId);
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginUser(data) {
  const phone = normalizePhone(data.phone);
  const user = findUserByPhone(phone);

  // Use the same generic error for both "not found" and "wrong pin" to avoid
  // leaking account existence.
  const authError = new AppError(401, 'Invalid mobile number or PIN.', 'INVALID_CREDENTIALS');

  if (!user) throw authError;
  if (user.status !== 'active') {
    throw new AppError(403, 'This account has been suspended.', 'ACCOUNT_SUSPENDED');
  }

  const valid = await argon2.verify(user.password_hash, data.pin);
  if (!valid) throw authError;

  // Build worker profile id if applicable
  let workerProfileId = null;
  if (user.role === 'worker') {
    const { findWorkerProfileByUserId } = await import('./auth.repository.js');
    const profile = findWorkerProfileByUserId(user.id);
    if (profile) workerProfileId = profile.id;
  }

  return publicUser(user, workerProfileId);
}
