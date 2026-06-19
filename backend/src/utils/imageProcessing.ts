import path from 'path';

import sharp from 'sharp';

interface UploadedImageInput {
  buffer: Buffer;
  originalName: string;
  contentType: string;
}

const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 80;

function replaceExtension(fileName: string, newExtension: string) {
  const extension = path.extname(fileName);
  return extension
    ? `${fileName.slice(0, -extension.length)}${newExtension}`
    : `${fileName}${newExtension}`;
}

export async function optimizeUploadedImage(input: UploadedImageInput) {
  const buffer = await sharp(input.buffer)
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return {
    buffer,
    originalName: replaceExtension(input.originalName, '.webp'),
    contentType: 'image/webp',
  };
}
