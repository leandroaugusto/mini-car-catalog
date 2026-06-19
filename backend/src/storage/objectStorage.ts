import path from 'path';
import { randomUUID } from 'crypto';

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

interface UploadObjectInput {
  buffer: Buffer;
  originalName: string;
  contentType: string;
  key?: string;
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function getR2Endpoint() {
  return `https://${getRequiredEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`;
}

function getBucketName() {
  return getRequiredEnv('R2_BUCKET_NAME');
}

function getPublicBaseUrl() {
  return getRequiredEnv('R2_PUBLIC_BASE_URL').replace(/\/$/, '');
}

let cachedClient: S3Client | null = null;

function getObjectStorageClient() {
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: 'auto',
      endpoint: getR2Endpoint(),
      credentials: {
        accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
        secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  return cachedClient;
}

export function buildPhotoUrl(photoKey?: string | null) {
  return photoKey ? `${getPublicBaseUrl()}/${photoKey}` : undefined;
}

export function buildObjectKey(originalName: string) {
  const extension = path.extname(originalName) || '.jpg';
  return `mini-cars/${randomUUID()}${extension.toLowerCase()}`;
}

export async function uploadObject(input: UploadObjectInput) {
  const key = input.key ?? buildObjectKey(input.originalName);

  await getObjectStorageClient().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: input.buffer,
      ContentType: input.contentType,
    })
  );

  return {
    key,
    originalName: input.originalName,
  };
}

export async function deleteObject(photoKey?: string | null) {
  if (!photoKey) {
    return;
  }

  await getObjectStorageClient().send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: photoKey,
    })
  );
}
