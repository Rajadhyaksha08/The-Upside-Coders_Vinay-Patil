import { Router } from 'express';
import { validateRequest } from '../../middleware/validate-request.js';
import { createSessionSchema, sessionEventSchema } from './ivr.schema.js';
import { create, get, event } from './ivr.controller.js';

export const ivrRouter = Router();

// Public endpoints — IVR providers don't carry session cookies
ivrRouter.post('/sessions', validateRequest({ body: createSessionSchema }), create);
ivrRouter.get('/sessions/:id', get);
ivrRouter.post('/sessions/:id/event', validateRequest({ body: sessionEventSchema }), event);
