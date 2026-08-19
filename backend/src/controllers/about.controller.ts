import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const get = async (_req: Request, res: Response): Promise<void> => {
  try {
    let about = await prisma.about.findFirst();
    if (!about) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    res.json(about);
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    let about = await prisma.about.findFirst();
    if (!about) {
      about = await prisma.about.create({ data: req.body });
    } else {
      about = await prisma.about.update({ where: { id: about.id }, data: req.body });
    }
    res.json({ success: true, data: about });
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
