import fs from 'fs';
import path from 'path';

export const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

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

export function getPublicApiBaseUrl() {
  return process.env.PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5001';
}

export function buildPhotoUrl(fileName?: string | null) {
  return fileName ? `${getPublicApiBaseUrl()}/uploads/${fileName}` : undefined;
}

export function deleteFileIfExists(filePath?: string | null) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
