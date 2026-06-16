import path from 'path';
import { randomUUID } from 'crypto';

import multer from 'multer';

import { allowedMimeTypes, ensureUploadDir } from '../utils/files';

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, ensureUploadDir());
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname) || '.jpg';
    callback(null, `${randomUUID()}${extension.toLowerCase()}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error('Only JPG, PNG, and WEBP images are allowed'));
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
