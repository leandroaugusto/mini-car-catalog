import path from 'path';

import mongoose, { Types } from 'mongoose';

import { downloadObject, uploadObject } from '../storage/objectStorage';
import { optimizeUploadedImage } from '../utils/imageProcessing';

interface MiniCarWithPhotoKey {
  _id: Types.ObjectId;
  photoKey?: string;
  photoOriginalName?: string;
}

function getMongoUri() {
  return process.env.MONGODB_URI ?? 'mongodb://mongodb:27017/mini-car-catalog';
}

function guessMimeTypeFromKey(photoKey: string) {
  const extension = path.extname(photoKey).toLowerCase();

  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
    default:
      return 'image/webp';
  }
}

async function optimizeExistingR2Photos() {
  await mongoose.connect(getMongoUri());

  const collection = mongoose.connection.collection('minicars');
  const records = await collection
    .find<MiniCarWithPhotoKey>({
      photoKey: { $exists: true, $ne: null },
    })
    .toArray();

  let optimized = 0;
  let skipped = 0;

  for (const record of records) {
    if (!record.photoKey) {
      skipped += 1;
      continue;
    }

    const originalName =
      record.photoOriginalName ?? path.basename(record.photoKey);
    const contentType = guessMimeTypeFromKey(record.photoKey);
    const originalBuffer = await downloadObject(record.photoKey);
    const optimizedImage = await optimizeUploadedImage({
      buffer: originalBuffer,
      originalName,
      contentType,
      formatStrategy: 'preserve',
    });

    await uploadObject({
      buffer: optimizedImage.buffer,
      originalName: optimizedImage.originalName,
      contentType: optimizedImage.contentType,
      key: record.photoKey,
    });

    optimized += 1;
    console.log(`Optimized ${record._id.toString()} -> ${record.photoKey}`);
  }

  console.log(
    `Optimization complete. Optimized: ${optimized}. Skipped: ${skipped}.`
  );
}

void optimizeExistingR2Photos()
  .catch((error) => {
    console.error('R2 optimization failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
