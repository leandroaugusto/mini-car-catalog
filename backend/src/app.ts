import cors from 'cors';
import express from 'express';
import multer from 'multer';

import { miniCarRouter } from './routes/miniCars';
import { getUploadDir } from './utils/files';
import { HttpError } from './utils/httpError';

export const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(getUploadDir()));
app.use('/api', miniCarRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    res.status(statusCode).json({ error: { message: error.message } });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: { message: error.message } });
    return;
  }

  if (error instanceof Error) {
    res.status(400).json({ error: { message: error.message } });
    return;
  }

  res.status(500).json({ error: { message: 'Internal server error' } });
});
