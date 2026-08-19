import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: { id: string; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ success: false, message: 'Access Denied: No Authentication Token Found' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; email: string };
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Access Denied: Invalid or Expired Token' });
  }
};
