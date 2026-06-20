import { MiniCarListQuery, MiniCarPayload } from '../types/miniCar';
import { HttpError } from '../utils/httpError';

const scalePattern = /^\d+:\d+$/;
const currentYear = new Date().getFullYear();

function normalizeString(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return value.trim();
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function validateMiniCarPayload(
  input: Record<string, unknown>,
  options: { photoRequired: boolean; hasPhoto: boolean }
): MiniCarPayload {
  const carBrand = normalizeString(input.carBrand, 'Car brand');
  const carModel = normalizeString(input.carModel, 'Car model');
  const miniBrand = normalizeString(input.miniBrand, 'Mini brand');
  const miniScale = normalizeString(input.miniScale, 'Mini scale');
  const parsedYear = Number(input.carYear);

  if (
    !Number.isInteger(parsedYear) ||
    parsedYear < 1900 ||
    parsedYear > currentYear
  ) {
    throw new HttpError(400, 'Car year must be a valid year');
  }

  if (!scalePattern.test(miniScale)) {
    throw new HttpError(400, 'Mini scale must use the format 1:64');
  }

  if (options.photoRequired && !options.hasPhoto) {
    throw new HttpError(400, 'Photo is required');
  }

  return {
    carBrand,
    carModel,
    carYear: parsedYear,
    miniBrand,
    collection: normalizeOptionalString(input.collection),
    miniScale,
  };
}

export function parseListQuery(
  input: Record<string, unknown>
): MiniCarListQuery {
  const page = Math.max(1, Number(input.page ?? 1) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(input.pageSize ?? 20) || 20)
  );
  const sortBy = typeof input.sortBy === 'string' ? input.sortBy : 'createdAt';
  const sortOrder = input.sortOrder === 'asc' ? 'asc' : 'desc';

  return {
    search: typeof input.search === 'string' ? input.search.trim() : undefined,
    carBrand:
      typeof input.carBrand === 'string' ? input.carBrand.trim() : undefined,
    carModel:
      typeof input.carModel === 'string' ? input.carModel.trim() : undefined,
    carYear: input.carYear ? Number(input.carYear) : undefined,
    miniBrand:
      typeof input.miniBrand === 'string' ? input.miniBrand.trim() : undefined,
    collection:
      typeof input.collection === 'string'
        ? input.collection.trim()
        : undefined,
    miniScale:
      typeof input.miniScale === 'string' ? input.miniScale.trim() : undefined,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
}
