import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sendNotificationEmail } from '../services/email.service';

export const submit = async (req: Request, res: Response): Promise<void> => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400).json({ success: false, message: 'All fields are required' });
    return;
  }
  try {
    // Save to DB first — message is never lost even if email fails
    await prisma.message.create({ data: { name, email, subject, message } });
    // Fire-and-forget email notification
    sendNotificationEmail({ name, email, subject, message }).catch(console.error);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (e) {
    console.error('[Contact Form Error]', e);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
  } catch (e) { res.status(500).json({ success: false, message: 'Server Error' }); }
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.message.update({ where: { id: req.params.id }, data: { read: true } });
    res.json({ success: true });
  } catch (e) { res.status(404).json({ success: false, message: 'Message not found' }); }
};
