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

  it('can preserve the original jpeg format for in-place rewrites', async () => {
    const inputBuffer = await sharp({
      create: {
        width: 2200,
        height: 1400,
        channels: 3,
        background: { r: 0, g: 80, b: 220 },
      },
    })
      .jpeg({ quality: 100 })
      .toBuffer();

    const result = await optimizeUploadedImage({
      buffer: inputBuffer,
      originalName: 'existing-car.jpeg',
      contentType: 'image/jpeg',
      formatStrategy: 'preserve',
    });

    const metadata = await sharp(result.buffer).metadata();

    expect(result.contentType).toBe('image/jpeg');
    expect(result.originalName).toBe('existing-car.jpeg');
    expect(metadata.format).toBe('jpeg');
    expect(metadata.width).toBeLessThanOrEqual(1600);
    expect(metadata.height).toBeLessThanOrEqual(1600);
    expect(result.buffer.byteLength).toBeLessThan(inputBuffer.byteLength);
  });

  it('can preserve png images for in-place rewrites', async () => {
    const inputBuffer = await sharp({
      create: {
        width: 1800,
        height: 1200,
        channels: 4,
        background: { r: 20, g: 120, b: 220, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const result = await optimizeUploadedImage({
      buffer: inputBuffer,
      originalName: 'existing-car.png',
      contentType: 'image/png',
      formatStrategy: 'preserve',
    });

    const metadata = await sharp(result.buffer).metadata();

    expect(result.contentType).toBe('image/png');
    expect(result.originalName).toBe('existing-car.png');
    expect(metadata.format).toBe('png');
    expect(metadata.width).toBeLessThanOrEqual(1600);
    expect(metadata.height).toBeLessThanOrEqual(1600);
  });

  it('can preserve webp images for in-place rewrites', async () => {
    const inputBuffer = await sharp({
      create: {
        width: 1900,
        height: 1300,
        channels: 3,
        background: { r: 20, g: 200, b: 80 },
      },
    })
      .webp({ quality: 100 })
      .toBuffer();

    const result = await optimizeUploadedImage({
      buffer: inputBuffer,
      originalName: 'existing-car.webp',
      contentType: 'image/webp',
      formatStrategy: 'preserve',
    });

    const metadata = await sharp(result.buffer).metadata();

    expect(result.contentType).toBe('image/webp');
    expect(result.originalName).toBe('existing-car.webp');
    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBeLessThanOrEqual(1600);
    expect(metadata.height).toBeLessThanOrEqual(1600);
  });
});
