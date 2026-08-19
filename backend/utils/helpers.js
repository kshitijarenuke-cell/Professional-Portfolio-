const cloudinary = require('cloudinary').v2;
const { Resend } = require('resend');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Resend
const resendKey = process.env.RESEND_API_KEY || 're_1234567890';
const isResendMock = resendKey === 're_1234567890' || !resendKey.startsWith('re_');
const resendInstance = isResendMock ? null : new Resend(resendKey);

// Initialize Cloudinary
const isCloudinaryMock = 
  !process.env.CLOUDINARY_CLOUD_NAME || 
  process.env.CLOUDINARY_CLOUD_NAME === 'demo' ||
  !process.env.CLOUDINARY_API_KEY ||
  process.env.CLOUDINARY_API_KEY.includes('12345');

if (!isCloudinaryMock) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Multer Setup (Local Disk Fallback + Cloudinary Upload Helper)
const localUploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Local storage configuration
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
});

// Multer parser configured to memory storage if using Cloudinary, or disk storage if local fallback
const uploadMiddleware = multer({
  storage: isCloudinaryMock ? localDiskStorage : multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Uploads a file (either from buffer or local path) to Cloudinary
 * Falls back to local URL if Cloudinary is not configured
 */
async function uploadToCloud(fileReq) {
  if (isCloudinaryMock) {
    // Return local URL
    const relativePath = `/uploads/${fileReq.filename}`;
    console.log(`[Upload Fallback] Saved file locally: ${relativePath}`);
    return relativePath;
  }

  // Upload to Cloudinary from memory buffer
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(fileReq.buffer);
  });
}

/**
 * Send email notification using Resend (falls back to console log if mock)
 */
async function sendNotificationEmail({ name, email, subject, message }) {
  if (isResendMock) {
    console.log('--------------------------------------------------');
    console.log('[Resend Mock Email Alert]');
    console.log(`To: Admin Inbox`);
    console.log(`From: ${email} (${name})`);
    console.log(`Subject: ${subject}`);
    console.log(`Message:\n${message}`);
    console.log('--------------------------------------------------');
    return { success: true, mock: true };
  }

  try {
    const data = await resendInstance.emails.send({
      from: 'Portfolio Contact Form <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL || 'kshitijarenuke@gmail.com',
      subject: `New Message: ${subject}`,
      html: `
        <h3>New Portfolio Message from ${name}</h3>
        <p><strong>Sender Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; padding: 10px; background: #f3f4f6; border-radius: 6px;">${message}</p>
      `
    });
    return { success: true, data };
  } catch (error) {
    console.error('[Resend Email Error]', error);
    // Return success: false, but don't crash so database save remains intact
    return { success: false, error };
  }
}

module.exports = {
  uploadMiddleware,
  uploadToCloud,
  sendNotificationEmail,
  isCloudinaryMock,
  isResendMock
};
