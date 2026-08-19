import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../utils/prisma';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Please provide email and password' });
    return;
  }
  try {
    const admin = await prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!admin) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }
    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
    };
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET as string,
      options
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logout successful' });
};

export const status = (req: Request, res: Response): void => {
  const token = req.cookies?.token;
  if (!token) { res.json({ isAuthenticated: false }); return; }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
    res.json({ isAuthenticated: true, email: decoded.email });
  } catch {
    res.json({ isAuthenticated: false });
  }
};
