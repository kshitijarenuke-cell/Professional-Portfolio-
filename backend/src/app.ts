import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Route imports
import authRoutes from './routes/auth.routes';
import projectsRoutes from './routes/projects.routes';
import techstackRoutes from './routes/techstack.routes';
import aboutRoutes from './routes/about.routes';
import contactRoutes from './routes/contact.routes';
import messagesRoutes from './routes/messages.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow requests from Vite dev server AND production frontend
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3001', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Cache control for all API routes ────────────────────────────────────────
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  next();
});

// ─── Static file serving ─────────────────────────────────────────────────────
// Serve uploaded files (local fallback when Cloudinary not configured)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Serve built Vite React frontend in production
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/techstack', techstackRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);

// ─── SPA Fallback ────────────────────────────────────────────────────────────
// Serve the React frontend dist index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, message: 'API route not found' });
    return;
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  console.log(`[Server] Database: PostgreSQL via Prisma`);
});

export default app;
