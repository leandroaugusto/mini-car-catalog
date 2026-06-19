import sharp from 'sharp';

import { optimizeUploadedImage } from './imageProcessing';

describe('optimizeUploadedImage', () => {
  it('resizes oversized uploads and converts them to webp', async () => {
    const inputBuffer = await sharp({
      create: {
        width: 2400,
        height: 1800,
        channels: 3,
        background: { r: 220, g: 0, b: 0 },
      },
    })
      .jpeg({ quality: 100 })
      .toBuffer();

    const result = await optimizeUploadedImage({
      buffer: inputBuffer,
      originalName: 'mustang.jpg',
      contentType: 'image/jpeg',
    });

    const metadata = await sharp(result.buffer).metadata();

    expect(result.contentType).toBe('image/webp');
    expect(result.originalName).toBe('mustang.webp');
    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBeLessThanOrEqual(1600);
    expect(metadata.height).toBeLessThanOrEqual(1600);
    expect(result.buffer.byteLength).toBeLessThan(inputBuffer.byteLength);
  });
});
