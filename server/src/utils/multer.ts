import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // In production, this might be /tmp or directly stream to S3
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and TIFF are allowed.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
