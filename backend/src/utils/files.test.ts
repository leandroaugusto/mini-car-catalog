import fs from 'fs';
import os from 'os';
import path from 'path';

import { ensureUploadDir, escapeRegex, getUploadDir } from './files';

describe('files utils', () => {
  const originalUploadDir = process.env.UPLOAD_DIR;

  afterEach(() => {
    process.env.UPLOAD_DIR = originalUploadDir;
  });

  it('resolves the configured upload directory', () => {
    process.env.UPLOAD_DIR = 'tmp/uploads';

    expect(getUploadDir()).toBe(path.resolve('tmp/uploads'));
  });

  it('creates the upload directory when it does not exist', () => {
    const tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mini-car-catalog-files-')
    );
    const uploadDir = path.join(tempDir, 'uploads');
    process.env.UPLOAD_DIR = uploadDir;

    const ensuredDir = ensureUploadDir();

    expect(ensuredDir).toBe(path.resolve(uploadDir));
    expect(fs.existsSync(ensuredDir)).toBe(true);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('escapes regular expression metacharacters', () => {
    expect(escapeRegex('Ferrari (F40)+?')).toBe('Ferrari \\(F40\\)\\+\\?');
  });
});
