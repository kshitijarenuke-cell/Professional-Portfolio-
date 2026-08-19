import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.techStack.findMany({ orderBy: { order: 'asc' } });
    res.json(items);
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await prisma.techStack.count();
    const item = await prisma.techStack.create({
      data: { ...req.body, order: req.body.order ?? count }
    });
    res.json({ success: true, data: item });
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await prisma.techStack.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: item });
  } catch (e) { res.status(404).json({ success: false, message: 'Tech not found' }); }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.techStack.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Skill deleted' });
  } catch (e) { res.status(404).json({ success: false, message: 'Tech not found' }); }
};
