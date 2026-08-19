import path from 'path';
import fs from 'fs';
import multer from 'multer';

const isCloudinaryReal =
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
  process.env.CLOUDINARY_API_KEY !== '123456789012345';

let cloudinary: any = null;
if (isCloudinaryReal) {
  const { v2: cld } = require('cloudinary');
  cld.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  cloudinary = cld;
}

// Multer — memory storage (file goes directly to Cloudinary or local)
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

export const uploadToCloud = async (file: Express.Multer.File): Promise<string> => {
  if (isCloudinaryReal && cloudinary) {
    // Upload buffer to Cloudinary
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'portfolio', resource_type: 'auto' },
        (err: any, result: any) => {
          if (err) reject(err);
          else resolve(result.secure_url);
        }
      );
      stream.end(file.buffer);
    });
  }

  // Local filesystem fallback
  const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, file.buffer);
  return `/uploads/${filename}`;
};

export { isCloudinaryReal };
