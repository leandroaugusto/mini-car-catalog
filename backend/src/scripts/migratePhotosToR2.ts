import fs from 'fs';
import path from 'path';

import mongoose, { Types } from 'mongoose';

import { uploadObject } from '../storage/objectStorage';
import { getUploadDir } from '../utils/files';

interface LegacyMiniCarRecord {
  _id: Types.ObjectId;
  photoFilename?: string;
  photoOriginalName?: string;
  photoPath?: string;
  photoKey?: string;
}

function getMongoUri() {
  return process.env.MONGODB_URI ?? 'mongodb://mongodb:27017/mini-car-catalog';
}

function buildMigratedPhotoKey(photoFilename: string) {
  return `mini-cars/${photoFilename}`;
}

function guessMimeType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.png':
    default:
      return 'image/png';
  }
}

function resolveLegacyPhotoPath(record: LegacyMiniCarRecord) {
  const candidates = [
    record.photoPath,
    record.photoFilename
      ? path.join(getUploadDir(), record.photoFilename)
      : undefined,
  ].filter((candidate): candidate is string => Boolean(candidate));

  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function migratePhotosToR2() {
  await mongoose.connect(getMongoUri());

  const collection = mongoose.connection.collection('minicars');
  const records = await collection
    .find<LegacyMiniCarRecord>({
      photoKey: { $exists: false },
      photoFilename: { $exists: true, $ne: null },
    })
    .toArray();

  let migrated = 0;
  let skipped = 0;

  for (const record of records) {
    if (!record.photoFilename) {
      skipped += 1;
      continue;
    }

    const sourcePath = resolveLegacyPhotoPath(record);

    if (!sourcePath) {
      console.warn(`Skipping ${record._id.toString()}: source file not found`);
      skipped += 1;
      continue;
    }

    const photoKey = buildMigratedPhotoKey(record.photoFilename);
    const buffer = fs.readFileSync(sourcePath);

    await uploadObject({
      buffer,
      originalName: record.photoOriginalName ?? record.photoFilename,
      contentType: guessMimeType(sourcePath),
      key: photoKey,
    });

    await collection.updateOne(
      { _id: record._id },
      {
        $set: {
          photoKey,
          photoOriginalName: record.photoOriginalName ?? record.photoFilename,
        },
        $unset: {
          photoFilename: '',
          photoPath: '',
        },
      }
    );

    migrated += 1;
    console.log(`Migrated ${record._id.toString()} -> ${photoKey}`);
  }

  console.log(`Migration complete. Migrated: ${migrated}. Skipped: ${skipped}.`);
}

void migratePhotosToR2()
  .catch((error) => {
    console.error('Photo migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
