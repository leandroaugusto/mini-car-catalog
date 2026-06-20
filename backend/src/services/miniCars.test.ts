jest.mock('../models/miniCar', () => ({
  MiniCar: {
    create: jest.fn(),
    countDocuments: jest.fn(),
    distinct: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.mock('../storage/objectStorage', () => ({
  buildPhotoUrl: jest.fn((photoKey?: string | null) =>
    photoKey ? `https://cdn.example.com/${photoKey}` : undefined
  ),
  deleteObject: jest.fn(async () => undefined),
  downloadObject: jest.fn(),
  uploadObject: jest.fn(),
}));

jest.mock('../utils/imageProcessing', () => ({
  optimizeUploadedImage: jest.fn(async (input: {
    buffer: Buffer;
    originalName: string;
    contentType: string;
  }) => ({
    buffer: input.buffer,
    originalName: input.originalName,
    contentType: input.contentType,
  })),
}));

import { MiniCar } from '../models/miniCar';
import { deleteObject, uploadObject } from '../storage/objectStorage';
import { createMiniCar, getMiniCarById, listMiniCars, updateMiniCar } from './miniCars';

function createMiniCarDoc(overrides: Partial<Record<string, unknown>> = {}) {
  const doc: Record<string, unknown> = {
    _id: { toString: () => 'mini-car-id' },
    carBrand: 'Ford',
    carModel: 'Mustang',
    carYear: 1967,
    miniBrand: 'Hot Wheels',
    collectionName: 'Muscle Cars',
    miniScale: '1:64',
    photoKey: 'mini-cars/original.webp',
    photoOriginalName: 'original.webp',
    createdAt: '2026-06-14T00:00:00.000Z',
    updatedAt: '2026-06-14T00:00:00.000Z',
    save: jest.fn(),
    deleteOne: jest.fn(),
  };

  Object.assign(doc, overrides);

  doc.toObject = jest.fn(() => ({
    _id: doc._id,
    carBrand: doc.carBrand,
    carModel: doc.carModel,
    carYear: doc.carYear,
    miniBrand: doc.miniBrand,
    collectionName: doc.collectionName,
    miniScale: doc.miniScale,
    photoKey: doc.photoKey,
    photoOriginalName: doc.photoOriginalName,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  return doc;
}

describe('miniCars service', () => {
  const mockedMiniCar = MiniCar as unknown as {
    create: jest.Mock;
    countDocuments: jest.Mock;
    find: jest.Mock;
    findById: jest.Mock;
  };

  const mockedDeleteObject = deleteObject as jest.Mock;
  const mockedUploadObject = uploadObject as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('applies the search filter to both brand and model queries', async () => {
    const item = createMiniCarDoc();
    const limit = jest.fn().mockResolvedValue([item]);
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });

    mockedMiniCar.find.mockReturnValue({ sort });
    mockedMiniCar.countDocuments.mockResolvedValue(1);

    await listMiniCars({
      search: 'Mustang',
      page: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(mockedMiniCar.find).toHaveBeenCalledWith({
      $or: [
        { carBrand: { $regex: 'Mustang', $options: 'i' } },
        { carModel: { $regex: 'Mustang', $options: 'i' } },
      ],
    });
  });

  it('throws when a mini car cannot be found by id', async () => {
    mockedMiniCar.findById.mockResolvedValue(null);

    await expect(getMiniCarById('missing-id')).rejects.toThrow('Mini car not found');
  });

  it('deletes the uploaded object if creating the record fails', async () => {
    mockedUploadObject.mockResolvedValue({
      key: 'mini-cars/new-upload.webp',
      originalName: 'new-upload.webp',
    });
    mockedMiniCar.create.mockRejectedValue(new Error('create failed'));

    await expect(
      createMiniCar(
        {
          carBrand: 'BMW',
          carModel: 'M3',
          carYear: 1990,
          miniBrand: 'Auto World',
          collection: 'DTM',
          miniScale: '1:64',
        },
        {
          buffer: Buffer.from('image'),
          mimetype: 'image/webp',
          originalname: 'm3.webp',
        } as Express.Multer.File
      )
    ).rejects.toThrow('create failed');

    expect(mockedDeleteObject).toHaveBeenCalledWith('mini-cars/new-upload.webp');
  });

  it('deletes the replacement object if saving an update fails', async () => {
    const document = createMiniCarDoc({
      photoKey: 'mini-cars/old-photo.webp',
      photoOriginalName: 'old-photo.webp',
    });

    (document.save as jest.Mock).mockRejectedValue(new Error('save failed'));
    mockedMiniCar.findById.mockResolvedValue(document);
    mockedUploadObject.mockResolvedValue({
      key: 'mini-cars/new-photo.webp',
      originalName: 'new-photo.webp',
    });

    await expect(
      updateMiniCar(
        'mini-car-id',
        {
          carBrand: 'BMW',
          carModel: 'M3 Evo',
          carYear: 1990,
          miniBrand: 'Auto World',
          collection: 'Legends',
          miniScale: '1:64',
        },
        {
          buffer: Buffer.from('image'),
          mimetype: 'image/webp',
          originalname: 'm3-evo.webp',
        } as Express.Multer.File
      )
    ).rejects.toThrow('save failed');

    expect(mockedDeleteObject).toHaveBeenCalledWith('mini-cars/new-photo.webp');
  });
});
