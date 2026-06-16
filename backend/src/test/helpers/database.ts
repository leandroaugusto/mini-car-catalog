import fs from 'fs';
import os from 'os';
import path from 'path';

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export async function connectTestDatabase() {
  mongoServer = await MongoMemoryServer.create();
  process.env.UPLOAD_DIR = fs.mkdtempSync(
    path.join(os.tmpdir(), 'mini-car-catalog-uploads-')
  );
  await mongoose.connect(mongoServer.getUri(), {
    dbName: 'mini-car-catalog-test',
  });
}

export async function disconnectTestDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }

  if (process.env.UPLOAD_DIR && fs.existsSync(process.env.UPLOAD_DIR)) {
    fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
  }
}

export async function clearTestDatabase() {
  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({}))
  );
}
