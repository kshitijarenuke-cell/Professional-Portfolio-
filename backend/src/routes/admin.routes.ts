import { Router } from 'express';
import { upload, getStats, exportBackup, importBackup, getSettings, updateSettings } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../services/cloudinary.service';

const router = Router();

// File upload
router.post('/upload', authMiddleware, uploadMiddleware.single('file'), upload);

// Admin stats
router.get('/stats', authMiddleware, getStats);

// Backup
router.get('/export', authMiddleware, exportBackup);
router.post('/import', authMiddleware, importBackup);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
