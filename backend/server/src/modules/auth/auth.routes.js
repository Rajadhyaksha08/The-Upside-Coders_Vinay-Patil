import { Router } from 'express';
import { register, login, logout, me } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { authRateLimit } from '../../middleware/rate-limit.js';
import { registerSchema, loginSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimit, validateRequest({ body: registerSchema }), register);
authRouter.post('/login',    authRateLimit, validateRequest({ body: loginSchema }),    login);
authRouter.post('/logout',   logout);
authRouter.get('/me',        me);
