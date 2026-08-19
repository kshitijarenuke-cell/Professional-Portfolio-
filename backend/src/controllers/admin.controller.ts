import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { uploadToCloud } from '../services/cloudinary.service';

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
    const fileUrl = await uploadToCloud(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (e) {
    console.error('[Upload Error]', e);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [projects, skills, messages] = await Promise.all([
      prisma.project.count(),
      prisma.techStack.count(),
      prisma.message.count()
    ]);
    const recentMessages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    res.json({ success: true, stats: { projects, skills, messages }, recentMessages });
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const exportBackup = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [about, contact, projects, settings, techstack] = await Promise.all([
      prisma.about.findMany(),
      prisma.contact.findMany(),
      prisma.project.findMany({ orderBy: { order: 'asc' } }),
      prisma.settings.findMany(),
      prisma.techStack.findMany({ orderBy: { order: 'asc' } }),
    ]);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=portfolio-backup.json');
    res.json({ about, contact, projects, settings, techstack });
  } catch (e) { res.status(500).json({ success: false, message: 'Backup export failed' }); }
};

export const importBackup = async (req: Request, res: Response): Promise<void> => {
  const { about, contact, projects, settings, techstack } = req.body;
  if (!about || !contact || !projects || !settings || !techstack) {
    res.status(400).json({ success: false, message: 'Invalid backup data format' });
    return;
  }
  try {
    await prisma.$transaction([
      prisma.about.deleteMany(),
      prisma.contact.deleteMany(),
      prisma.project.deleteMany(),
      prisma.settings.deleteMany(),
      prisma.techStack.deleteMany(),
    ]);
    if (about.length > 0) await prisma.about.createMany({ data: about.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }: any) => rest) });
    if (contact.length > 0) await prisma.contact.createMany({ data: contact.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }: any) => rest) });
    if (projects.length > 0) await prisma.project.createMany({ data: projects.map(({ id: _id, createdAt: _c, updatedAt: _u, ...rest }: any) => rest) });
    if (settings.length > 0) await prisma.settings.createMany({ data: settings.map(({ id: _id, ...rest }: any) => rest) });
    if (techstack.length > 0) await prisma.techStack.createMany({ data: techstack.map(({ id: _id, createdAt: _c, ...rest }: any) => rest) });
    res.json({ success: true, message: 'Portfolio data imported successfully' });
  } catch (e) {
    console.error('[Backup Import Error]', e);
    res.status(500).json({ success: false, message: 'Backup import failed' });
  }
};

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) settings = await prisma.settings.create({ data: {} });
    res.json(settings);
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) settings = await prisma.settings.create({ data: {} });
    settings = await prisma.settings.update({
      where: { id: settings.id },
      data: { projectView: req.body.projectView || 'grid' }
    });
    res.json({ success: true, data: settings });
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
