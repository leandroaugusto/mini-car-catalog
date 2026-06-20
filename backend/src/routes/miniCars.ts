import { Router } from 'express';

import {
  autocompleteBrandsHandler,
  autocompleteCollectionsHandler,
  autocompleteMiniBrandsHandler,
  autocompleteModelsHandler,
  createMiniCarHandler,
  deleteMiniCarHandler,
  getMiniCarHandler,
  listMiniCarsHandler,
  updateMiniCarHandler,
} from '../controllers/miniCars';
import { upload } from '../middleware/upload';

export const miniCarRouter = Router();

miniCarRouter.get('/autocomplete/brands', autocompleteBrandsHandler);
miniCarRouter.get('/autocomplete/collections', autocompleteCollectionsHandler);
miniCarRouter.get('/autocomplete/mini-brands', autocompleteMiniBrandsHandler);
miniCarRouter.get('/autocomplete/models', autocompleteModelsHandler);

miniCarRouter.get('/minicars', listMiniCarsHandler);
miniCarRouter.get('/minicars/:id', getMiniCarHandler);
miniCarRouter.post('/minicars', upload.single('photo'), createMiniCarHandler);
miniCarRouter.put(
  '/minicars/:id',
  upload.single('photo'),
  updateMiniCarHandler
);
miniCarRouter.delete('/minicars/:id', deleteMiniCarHandler);
