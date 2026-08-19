import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/techstack.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getAll);
router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;
