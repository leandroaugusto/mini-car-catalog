import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';

export async function createImageFixture(fileName = 'fixture.png') {
  const filePath = path.join(os.tmpdir(), fileName);
  return sharp({
    create: {
      width: 32,
      height: 32,
      channels: 3,
      background: { r: 200, g: 0, b: 0 },
    },
  })
    .png()
    .toFile(filePath)
    .then(() => filePath);
}

export function createTextFixture(fileName = 'fixture.txt') {
  const filePath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(filePath, 'not-an-image');
  return filePath;
}
