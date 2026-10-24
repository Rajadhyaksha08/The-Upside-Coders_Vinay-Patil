/**
 * IVR Service — provider-independent state machine.
 *
 * States: welcome → language → service_select → confirm → connect_worker → completed | error
 *
 * No Exotel APIs are used. All state is persisted in SQLite ivr_sessions.
 * A real Exotel adapter would wrap this service and translate webhooks
 * into createSession / handleEvent calls.
 */
import { AppError } from '../../shared/errors/app-error.js';
import { db } from '../../db/database.js';

// ── Transition table ─────────────────────────────────────────────────────────
const TRANSITIONS = {
  welcome: {
    '1': { nextState: 'language',       message: 'Please select your language. Press 1 for Hindi, 2 for English.' },
    '9': { nextState: 'welcome',        message: 'Welcome to KaamConnect. Press 1 for services, 0 for support.' },
    '0': { nextState: 'completed',      message: 'Connecting you to support. Please hold.' },
    _default: { nextState: 'welcome',   message: 'Invalid input. Press 1 for services, 9 to repeat, 0 for support.' },
  },
  language: {
    '1': { nextState: 'service_select', message: 'Hindi selected. Which service do you need? 1 Electrician, 2 Plumber, 3 Carpenter, 4 Cleaner.', language: 'Hindi' },
    '2': { nextState: 'service_select', message: 'English selected. Which service? 1 Electrician, 2 Plumber, 3 Carpenter, 4 Cleaner.', language: 'English' },
    '9': { nextState: 'language',       message: 'Please press 1 for Hindi or 2 for English.' },
    _default: { nextState: 'language',  message: 'Invalid input. Press 1 for Hindi, 2 for English.' },
  },
  service_select: {
    '1': { nextState: 'confirm', message: 'You selected Electrician. Press 1 to confirm, 9 to go back.', service: 'electrician' },
    '2': { nextState: 'confirm', message: 'You selected Plumber. Press 1 to confirm, 9 to go back.', service: 'plumber' },
    '3': { nextState: 'confirm', message: 'You selected Carpenter. Press 1 to confirm, 9 to go back.', service: 'carpenter' },
    '4': { nextState: 'confirm', message: 'You selected House Cleaner. Press 1 to confirm, 9 to go back.', service: 'house-cleaner' },
    '9': { nextState: 'language', message: 'Going back. Press 1 for Hindi, 2 for English.' },
    _default: { nextState: 'service_select', message: 'Invalid. Press 1-4 for service, 9 to go back.' },
  },
  confirm: {
    '1': { nextState: 'connect_worker', message: 'Confirmed! We are finding a worker near you. You will receive a call shortly.' },
    '9': { nextState: 'service_select', message: 'Going back. Press 1-4 for service.' },
    _default: { nextState: 'confirm',  message: 'Press 1 to confirm, 9 to go back.' },
  },
  connect_worker: {
    _default: { nextState: 'completed', message: 'Your request has been registered. Thank you for using KaamConnect.' },
  },
  completed:  { _default: { nextState: 'completed',  message: 'Session complete. Goodbye.' } },
  error:      { _default: { nextState: 'error',       message: 'An error occurred. Please call again.' } },
};

// ── CRUD ─────────────────────────────────────────────────────────────────────

export function createSession({ sessionId, callerPhone }) {
  const existing = db.prepare('SELECT * FROM ivr_sessions WHERE session_id = ?').get(sessionId);
  if (existing) return existing;

  db.prepare(`
    INSERT INTO ivr_sessions (session_id, caller_phone, state)
    VALUES (?, ?, 'welcome')
  `).run(sessionId, callerPhone);

  return db.prepare('SELECT * FROM ivr_sessions WHERE session_id = ?').get(sessionId);
}

export function getSession(sessionId) {
  const session = db.prepare('SELECT * FROM ivr_sessions WHERE session_id = ?').get(sessionId);
  if (!session) throw new AppError(404, 'IVR session not found.', 'NOT_FOUND');
  return session;
}

export function handleEvent(sessionId, input) {
  const session = getSession(sessionId);
  const stateTransitions = TRANSITIONS[session.state] || {};
  const transition = stateTransitions[input] || stateTransitions['_default'] || {
    nextState: 'error',
    message: 'Unexpected error. Please try again.',
  };

  // Persist updated state
  const updates = {
    state: transition.nextState,
    updated_at: new Date().toISOString(),
  };

  if (transition.language) updates.language = transition.language;
  if (transition.service)  updates.selected_service = transition.service;

  db.prepare(`
    UPDATE ivr_sessions
    SET state = @state,
        language = COALESCE(@language, language),
        selected_service = COALESCE(@selected_service, selected_service),
        updated_at = datetime('now')
    WHERE session_id = ?
  `).run({ ...updates, language: transition.language ?? null, selected_service: transition.service ?? null }, sessionId);

  // If we just confirmed a service, create a service request automatically
  if (transition.nextState === 'connect_worker' && session.selected_service) {
    _createIvrServiceRequest(sessionId, session);
  }

  const updated = db.prepare('SELECT * FROM ivr_sessions WHERE session_id = ?').get(sessionId);
  return { session: updated, message: transition.message, state: transition.nextState };
}

function _createIvrServiceRequest(sessionId, session) {
  try {
    // Find the service category
    const cat = db.prepare('SELECT id FROM service_categories WHERE slug = ?').get(session.selected_service);
    if (!cat) return;

    // Try to find a user by phone
    const user = db.prepare('SELECT id FROM users WHERE phone = ?').get(session.caller_phone);
    if (!user) return; // anonymous caller — no request created

    const result = db.prepare(`
      INSERT INTO service_requests (customer_id, service_category_id, title, description, status)
      VALUES (?, ?, ?, 'Service requested via IVR call', 'open')
    `).run(user.id, cat.id, `IVR Request — ${session.selected_service}`);

    db.prepare(`
      UPDATE ivr_sessions SET linked_request_id = ?, updated_at = datetime('now')
      WHERE session_id = ?
    `).run(result.lastInsertRowid, sessionId);
  } catch { /* best-effort */ }
}
