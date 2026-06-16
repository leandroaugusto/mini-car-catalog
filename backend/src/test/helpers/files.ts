import fs from 'fs';
import os from 'os';
import path from 'path';

const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l9pQAAAAASUVORK5CYII=';

export function createImageFixture(fileName = 'fixture.png') {
  const filePath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(filePath, Buffer.from(PNG_BASE64, 'base64'));
  return filePath;
}

export function createTextFixture(fileName = 'fixture.txt') {
  const filePath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(filePath, 'not-an-image');
  return filePath;
}
