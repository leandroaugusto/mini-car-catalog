import multer from 'multer';
import request from 'supertest';

import { app, errorHandler } from './app';
import { HttpError } from './utils/httpError';

describe('app bootstrap', () => {
  it('responds to health checks', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

describe('errorHandler', () => {
  function createResponseMock() {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    return response;
  }

  it('returns 413 for Multer file size errors', () => {
    const response = createResponseMock();

    errorHandler(
      new multer.MulterError('LIMIT_FILE_SIZE'),
      {} as never,
      response as never,
      jest.fn()
    );

    expect(response.status).toHaveBeenCalledWith(413);
    expect(response.json).toHaveBeenCalledWith({
      error: { message: 'File too large' },
    });
  });

  it('returns the HttpError status code and message', () => {
    const response = createResponseMock();

    errorHandler(
      new HttpError(404, 'Mini car not found'),
      {} as never,
      response as never,
      jest.fn()
    );

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      error: { message: 'Mini car not found' },
    });
  });

  it('returns 500 for unknown non-Error values', () => {
    const response = createResponseMock();

    errorHandler('unexpected' as never, {} as never, response as never, jest.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: { message: 'Internal server error' },
    });
  });
});
