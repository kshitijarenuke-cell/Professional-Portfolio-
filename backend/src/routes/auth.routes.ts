import { Router } from 'express';
import { login, logout, status } from '../controllers/auth.controller';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again after 15 minutes.' }
});

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/status', status);

export default router;
