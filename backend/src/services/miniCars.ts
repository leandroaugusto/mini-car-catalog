import path from 'path';

import { MiniCar, MiniCarDocument } from '../models/miniCar';
import {
  buildPhotoUrl,
  deleteObject,
  uploadObject,
} from '../storage/objectStorage';
import { MiniCarListQuery, MiniCarPayload } from '../types/miniCar';
import { escapeRegex } from '../utils/files';
import { optimizeUploadedImage } from '../utils/imageProcessing';
import { HttpError } from '../utils/httpError';

function serializeMiniCar(item: MiniCarDocument) {
  return {
    id: item._id.toString(),
    carBrand: item.carBrand,
    carModel: item.carModel,
    carYear: item.carYear,
    miniBrand: item.miniBrand,
    collection: item.collectionName,
    miniScale: item.miniScale,
    photoKey: item.photoKey,
    photoFilename: item.photoKey ? path.basename(item.photoKey) : undefined,
    photoOriginalName: item.photoOriginalName,
    photoUrl: buildPhotoUrl(item.photoKey),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function buildListFilter(query: MiniCarListQuery) {
  const filter: Record<string, unknown> = {};

  if (query.carBrand) filter.carBrand = query.carBrand;
  if (query.carModel) filter.carModel = query.carModel;
  if (query.carYear) filter.carYear = query.carYear;
  if (query.miniBrand) filter.miniBrand = query.miniBrand;
  if (query.collection) filter.collectionName = query.collection;
  if (query.miniScale) filter.miniScale = query.miniScale;

  if (query.search) {
    const expression = { $regex: escapeRegex(query.search), $options: 'i' };
    filter.$or = [{ carBrand: expression }, { carModel: expression }];
  }

  return filter;
}

function buildSort(query: MiniCarListQuery) {
  const allowedSortFields = new Set([
    'carBrand',
    'carModel',
    'carYear',
    'miniBrand',
    'collection',
    'miniScale',
    'createdAt',
  ]);

  const sortBy = allowedSortFields.has(query.sortBy ?? '')
    ? (query.sortBy as string)
    : 'createdAt';
  const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

  return { [sortBy]: sortDirection } as Record<string, 1 | -1>;
}

async function findMiniCarOrThrow(id: string) {
  const miniCar = await MiniCar.findById(id);

  if (!miniCar) {
    throw new HttpError(404, 'Mini car not found');
  }

  return miniCar;
}

export async function createMiniCar(
  payload: MiniCarPayload,
  file?: Express.Multer.File
) {
  const optimizedFile = file
    ? await optimizeUploadedImage({
        buffer: file.buffer,
        originalName: file.originalname,
        contentType: file.mimetype,
      })
    : undefined;
  const uploadedPhoto = file
    ? await uploadObject({
        buffer: optimizedFile!.buffer,
        originalName: optimizedFile!.originalName,
        contentType: optimizedFile!.contentType,
      })
    : undefined;

  try {
    const miniCar = await MiniCar.create({
      carBrand: payload.carBrand,
      carModel: payload.carModel,
      carYear: payload.carYear,
      miniBrand: payload.miniBrand,
      collectionName: payload.collection,
      miniScale: payload.miniScale,
      photoKey: uploadedPhoto?.key,
      photoOriginalName: uploadedPhoto?.originalName,
    });

    return serializeMiniCar(miniCar.toObject() as MiniCarDocument);
  } catch (error) {
    await deleteObject(uploadedPhoto?.key);
    throw error;
  }
}

export async function listMiniCars(query: MiniCarListQuery) {
  const filter = buildListFilter(query);
  const [items, totalItems] = await Promise.all([
    MiniCar.find(filter)
      .sort(buildSort(query))
      .skip((query.page - 1) * query.pageSize)
      .limit(query.pageSize),
    MiniCar.countDocuments(filter),
  ]);

  return {
    items: items.map((item) =>
      serializeMiniCar(item.toObject() as MiniCarDocument)
    ),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
    },
  };
}

export async function getMiniCarById(id: string) {
  const miniCar = await findMiniCarOrThrow(id);
  return serializeMiniCar(miniCar.toObject() as MiniCarDocument);
}

export async function updateMiniCar(
  id: string,
  payload: MiniCarPayload,
  file?: Express.Multer.File
) {
  const miniCar = await findMiniCarOrThrow(id);
  const previousPhotoKey = miniCar.photoKey;
  const optimizedFile = file
    ? await optimizeUploadedImage({
        buffer: file.buffer,
        originalName: file.originalname,
        contentType: file.mimetype,
      })
    : undefined;
  const uploadedPhoto = file
    ? await uploadObject({
        buffer: optimizedFile!.buffer,
        originalName: optimizedFile!.originalName,
        contentType: optimizedFile!.contentType,
      })
    : undefined;

  miniCar.carBrand = payload.carBrand;
  miniCar.carModel = payload.carModel;
  miniCar.carYear = payload.carYear;
  miniCar.miniBrand = payload.miniBrand;
  miniCar.collectionName = payload.collection;
  miniCar.miniScale = payload.miniScale;

  if (uploadedPhoto) {
    miniCar.photoKey = uploadedPhoto.key;
    miniCar.photoOriginalName = uploadedPhoto.originalName;
  }

  try {
    await miniCar.save();
  } catch (error) {
    await deleteObject(uploadedPhoto?.key);
    throw error;
  }

  if (uploadedPhoto) {
    await deleteObject(previousPhotoKey);
  }

  return serializeMiniCar(miniCar.toObject() as MiniCarDocument);
}

export async function deleteMiniCar(id: string) {
  const miniCar = await findMiniCarOrThrow(id);
  const photoKey = miniCar.photoKey;

  await miniCar.deleteOne();
  await deleteObject(photoKey);
}

export async function getBrandSuggestions(query: string) {
  const items = await MiniCar.distinct('carBrand', {
    carBrand: { $regex: escapeRegex(query), $options: 'i' },
  });

  return items.sort().slice(0, 10);
}

export async function getMiniBrandSuggestions(query: string) {
  const items = await MiniCar.distinct('miniBrand', {
    miniBrand: { $regex: escapeRegex(query), $options: 'i' },
  });

  return items.sort().slice(0, 10);
}

export async function getCollectionSuggestions(query: string) {
  const items = await MiniCar.distinct('collectionName', {
    collectionName: { $regex: escapeRegex(query), $options: 'i' },
  });

  return items.filter(Boolean).sort().slice(0, 10);
}

export async function getModelSuggestions(query: string, brand: string) {
  const items = await MiniCar.distinct('carModel', {
    carBrand: brand,
    carModel: { $regex: escapeRegex(query), $options: 'i' },
  });

  return items.sort().slice(0, 10);
}
