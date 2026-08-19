import { Router } from 'express';
import { get, update } from '../controllers/about.controller';
import { authMiddleware } from '../middleware/auth.middleware';
const router = Router();
router.get('/', get);
router.put('/', authMiddleware, update);
export default router;
