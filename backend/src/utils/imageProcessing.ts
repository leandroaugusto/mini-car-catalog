import path from 'path';

import sharp from 'sharp';

interface UploadedImageInput {
  buffer: Buffer;
  originalName: string;
  contentType: string;
  formatStrategy?: 'webp' | 'preserve';
}

const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 80;
const JPEG_QUALITY = 82;

function replaceExtension(fileName: string, newExtension: string) {
  const extension = path.extname(fileName);
  return extension
    ? `${fileName.slice(0, -extension.length)}${newExtension}`
    : `${fileName}${newExtension}`;
}

function buildImagePipeline(buffer: Buffer) {
  return sharp(buffer).rotate().resize({
    width: MAX_IMAGE_DIMENSION,
    height: MAX_IMAGE_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  });
}

export async function optimizeUploadedImage(input: UploadedImageInput) {
  if (input.formatStrategy === 'preserve') {
    if (input.contentType === 'image/jpeg') {
      return {
        buffer: await buildImagePipeline(input.buffer)
          .jpeg({ quality: JPEG_QUALITY })
          .toBuffer(),
        originalName: input.originalName,
        contentType: 'image/jpeg',
      };
    }

    if (input.contentType === 'image/png') {
      return {
        buffer: await buildImagePipeline(input.buffer)
          .png({ compressionLevel: 9, palette: true })
          .toBuffer(),
        originalName: input.originalName,
        contentType: 'image/png',
      };
    }

    if (input.contentType === 'image/webp') {
      return {
        buffer: await buildImagePipeline(input.buffer)
          .webp({ quality: WEBP_QUALITY })
          .toBuffer(),
        originalName: input.originalName,
        contentType: 'image/webp',
      };
    }
  }

  const buffer = await buildImagePipeline(input.buffer)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return {
    buffer,
    originalName: replaceExtension(input.originalName, '.webp'),
    contentType: 'image/webp',
  };
}
