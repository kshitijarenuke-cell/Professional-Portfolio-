import { Router } from 'express';
import { submit, getAll, markRead } from '../controllers/messages.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const msgLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many messages. Try again after an hour.' }
});

router.post('/', msgLimiter, submit);
router.get('/', authMiddleware, getAll);
router.patch('/:id/read', authMiddleware, markRead);

export default router;
