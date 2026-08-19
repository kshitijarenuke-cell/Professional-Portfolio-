import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { order: 'asc' } });
    res.json(projects);
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await prisma.project.count();
    const project = await prisma.project.create({
      data: { ...req.body, order: req.body.order ?? count }
    });
    res.json({ success: true, data: project });
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: project });
  } catch (e) { res.status(404).json({ success: false, message: 'Project not found' }); }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Project deleted' });
  } catch (e) { res.status(404).json({ success: false, message: 'Project not found' }); }
};
