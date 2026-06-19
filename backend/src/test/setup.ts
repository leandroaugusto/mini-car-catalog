process.env.NODE_ENV = 'test';

jest.mock('../storage/objectStorage', () => ({
  buildPhotoUrl: jest.fn((photoKey?: string) =>
    photoKey ? `https://cdn.example.com/${photoKey}` : undefined
  ),
  deleteObject: jest.fn(async () => undefined),
  uploadObject: jest.fn(async (file: { originalName: string }) => ({
    key: `mini-cars/${file.originalName}`,
    originalName: file.originalName,
  })),
}));
