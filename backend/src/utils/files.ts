import fs from 'fs';
import path from 'path';

export const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function getUploadDir() {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.resolve(process.cwd(), 'uploads');
}

export function ensureUploadDir() {
  const uploadDir = getUploadDir();
  fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
