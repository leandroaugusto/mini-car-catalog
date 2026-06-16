import request from 'supertest';
import { app } from './app';

describe('app bootstrap', () => {
  it('responds to health checks', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
