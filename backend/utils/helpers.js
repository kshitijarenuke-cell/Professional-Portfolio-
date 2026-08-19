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
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name' &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  !process.env.CLOUDINARY_API_KEY.includes('12345') &&
  process.env.CLOUDINARY_API_KEY !== 'your_cloudinary_api_key' &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== 'your_cloudinary_api_secret' &&
  process.env.CLOUDINARY_API_SECRET !== 'your_api_secret'
);

const isCloudinaryMock = !isCloudinaryConfigured;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log(`[Cloudinary] Initialized with cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else {
  console.log('[Cloudinary] Running in local development fallback mode (Cloudinary keys unconfigured)');
}

// Multer Setup (Local Disk Fallback + Cloudinary Memory Storage Helper)
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

// Multer parser configured to memory storage when using Cloudinary or in production
const uploadMiddleware = multer({
  storage: (isCloudinaryConfigured || process.env.NODE_ENV === 'production') ? multer.memoryStorage() : localDiskStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * Uploads a file (either from buffer or local path) to Cloudinary
 * In production: throws an error if Cloudinary is not configured or fails.
 * In development: falls back to local disk URL only if Cloudinary is not configured.
 */
async function uploadToCloud(fileReq) {
  if (!fileReq) {
    throw new Error('No file provided for upload.');
  }

  // In production, Cloudinary credentials are required
  if (process.env.NODE_ENV === 'production' && !isCloudinaryConfigured) {
    throw new Error('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or invalid in Render Environment settings.');
  }

  // If Cloudinary is not configured and running locally, use disk fallback
  if (!isCloudinaryConfigured) {
    if (fileReq.filename) {
      const relativePath = `/uploads/${fileReq.filename}`;
      console.log(`[Upload Dev Fallback] Saved file locally: ${relativePath}`);
      return relativePath;
    }
    throw new Error('Cloudinary is not configured in local environment.');
  }

  // Upload to Cloudinary from memory buffer or file stream
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error);
          reject(new Error(error.message || 'Cloudinary upload failed'));
        } else if (!result || !result.secure_url) {
          reject(new Error('Cloudinary did not return a secure URL'));
        } else {
          console.log(`[Cloudinary Upload Success] URL: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      }
    );

    if (fileReq.buffer) {
      uploadStream.end(fileReq.buffer);
    } else if (fileReq.path && fs.existsSync(fileReq.path)) {
      fs.createReadStream(fileReq.path).pipe(uploadStream);
    } else {
      reject(new Error('No valid file buffer or file path available for Cloudinary upload'));
    }
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
