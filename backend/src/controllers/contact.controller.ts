import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const get = async (_req: Request, res: Response): Promise<void> => {
  try {
    const contact = await prisma.contact.findFirst();
    res.json(contact);
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    let contact = await prisma.contact.findFirst();
    if (!contact) {
      contact = await prisma.contact.create({ data: req.body });
    } else {
      contact = await prisma.contact.update({ where: { id: contact.id }, data: req.body });
    }
    res.json({ success: true, data: contact });
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};
