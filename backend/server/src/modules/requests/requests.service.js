import { AppError } from '../../shared/errors/app-error.js';
import {
  createRequest as createRequestInDb,
  findRequestById,
  findRequestsByCustomer,
  updateRequest as updateRequestInDb,
  findServiceCategoryById,
  findWorkerProfileById,
  selectWorkerTransaction,
} from './requests.repository.js';

// ── Valid status transitions ─────────────────────────────────────────────────
const VALID_TRANSITIONS = {
  open:        ['assigned', 'cancelled'],
  assigned:    ['in_progress', 'open', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
};

// ── Create ───────────────────────────────────────────────────────────────────

export function createServiceRequest(customerId, data) {
  // Validate service category exists
  const category = findServiceCategoryById(data.serviceCategoryId);
  if (!category) {
    throw new AppError(400, 'Invalid service category.', 'INVALID_SERVICE_CATEGORY');
  }

  const request = createRequestInDb({
    customer_id:         customerId,
    service_category_id: data.serviceCategoryId,
    title:               data.title.trim(),
    description:         data.description?.trim() ?? null,
    budget:              data.budget ?? null,
    address:             data.address?.trim() ?? null,
    pincode:             data.pincode ?? null,
    preferred_date:      data.preferredDate ?? null,
    preferred_time:      data.preferredTime ?? null,
  });

  return request;
}

// ── List ─────────────────────────────────────────────────────────────────────

export function getCustomerRequests(customerId, filters) {
  const { requests, total } = findRequestsByCustomer(customerId, filters);
  const { page, limit } = filters;
  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// ── Get one ──────────────────────────────────────────────────────────────────

export function getRequestById(requestId, userId) {
  const request = findRequestById(requestId);
  if (!request) {
    throw new AppError(404, 'Service request not found.', 'NOT_FOUND');
  }
  // Only the owner can view their request
  if (request.customerId !== userId) {
    throw new AppError(403, 'You do not have access to this request.', 'FORBIDDEN');
  }
  return request;
}

// ── Update ───────────────────────────────────────────────────────────────────

export function updateServiceRequest(requestId, userId, data) {
  const request = findRequestById(requestId);
  if (!request) {
    throw new AppError(404, 'Service request not found.', 'NOT_FOUND');
  }
  if (request.customerId !== userId) {
    throw new AppError(403, 'You do not have access to this request.', 'FORBIDDEN');
  }
  if (request.status !== 'open') {
    throw new AppError(409, 'Only open requests can be updated.', 'INVALID_STATUS');
  }

  const dbFields = {};
  if (data.title !== undefined)         dbFields.title          = data.title.trim();
  if (data.description !== undefined)   dbFields.description    = data.description.trim();
  if (data.budget !== undefined)        dbFields.budget         = data.budget;
  if (data.address !== undefined)       dbFields.address        = data.address.trim();
  if (data.pincode !== undefined)       dbFields.pincode        = data.pincode;
  if (data.preferredDate !== undefined) dbFields.preferred_date = data.preferredDate;
  if (data.preferredTime !== undefined) dbFields.preferred_time = data.preferredTime;

  updateRequestInDb(requestId, dbFields);
  return findRequestById(requestId);
}

// ── Select worker ────────────────────────────────────────────────────────────

export function selectWorkerForRequest(requestId, userId, workerId) {
  const request = findRequestById(requestId);
  if (!request) {
    throw new AppError(404, 'Service request not found.', 'NOT_FOUND');
  }
  if (request.customerId !== userId) {
    throw new AppError(403, 'You do not have access to this request.', 'FORBIDDEN');
  }
  if (request.status !== 'open') {
    throw new AppError(409, 'Only open requests can have a worker selected.', 'INVALID_STATUS');
  }

  const worker = findWorkerProfileById(workerId);
  if (!worker) {
    throw new AppError(404, 'Worker not found or not active.', 'WORKER_NOT_FOUND');
  }

  return selectWorkerTransaction(requestId, workerId);
}

// ── Cancel ───────────────────────────────────────────────────────────────────

export function cancelRequest(requestId, userId) {
  const request = findRequestById(requestId);
  if (!request) {
    throw new AppError(404, 'Service request not found.', 'NOT_FOUND');
  }
  if (request.customerId !== userId) {
    throw new AppError(403, 'You do not have access to this request.', 'FORBIDDEN');
  }

  const allowed = VALID_TRANSITIONS[request.status];
  if (!allowed || !allowed.includes('cancelled')) {
    throw new AppError(409, `Cannot cancel a request with status '${request.status}'.`, 'INVALID_STATUS_TRANSITION');
  }

  updateRequestInDb(requestId, { status: 'cancelled' });
  return findRequestById(requestId);
}
