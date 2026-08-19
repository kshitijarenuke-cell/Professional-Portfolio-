import { Router } from 'express';
import { get, update } from '../controllers/contact.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = Router();
router.get('/', get);
router.put('/', authMiddleware, update);
export default router;
