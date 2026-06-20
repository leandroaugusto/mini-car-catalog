import { Request, Response } from 'express';

import {
  createMiniCar,
  deleteMiniCar,
  getBrandSuggestions,
  getCollectionSuggestions,
  getMiniBrandSuggestions,
  getMiniCarById,
  getModelSuggestions,
  listMiniCars,
  updateMiniCar,
} from '../services/miniCars';
import { parseListQuery, validateMiniCarPayload } from '../validators/miniCar';

export async function createMiniCarHandler(req: Request, res: Response) {
  const payload = validateMiniCarPayload(req.body, {
    photoRequired: false,
    hasPhoto: Boolean(req.file),
  });
  const item = await createMiniCar(payload, req.file);

  res.status(201).json({ item });
}

export async function listMiniCarsHandler(req: Request, res: Response) {
  const result = await listMiniCars(
    parseListQuery(req.query as Record<string, unknown>)
  );
  res.json(result);
}

export async function getMiniCarHandler(req: Request, res: Response) {
  const item = await getMiniCarById(String(req.params.id));
  res.json({ item });
}

export async function updateMiniCarHandler(req: Request, res: Response) {
  const payload = validateMiniCarPayload(req.body, {
    photoRequired: false,
    hasPhoto: Boolean(req.file),
  });
  const item = await updateMiniCar(String(req.params.id), payload, req.file);

  res.json({ item });
}

export async function deleteMiniCarHandler(req: Request, res: Response) {
  await deleteMiniCar(String(req.params.id));
  res.status(204).send();
}

export async function autocompleteBrandsHandler(req: Request, res: Response) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!query) {
    res.json({ items: [] });
    return;
  }

  res.json({ items: await getBrandSuggestions(query) });
}

export async function autocompleteMiniBrandsHandler(
  req: Request,
  res: Response
) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!query) {
    res.json({ items: [] });
    return;
  }

  res.json({ items: await getMiniBrandSuggestions(query) });
}

export async function autocompleteCollectionsHandler(
  req: Request,
  res: Response
) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (!query) {
    res.json({ items: [] });
    return;
  }

  res.json({ items: await getCollectionSuggestions(query) });
}

export async function autocompleteModelsHandler(req: Request, res: Response) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const brand =
    typeof req.query.brand === 'string' ? req.query.brand.trim() : '';

  if (!query || !brand) {
    res.json({ items: [] });
    return;
  }

  res.json({ items: await getModelSuggestions(query, brand) });
}
