import fs from 'fs';
import path from 'path';

import request from 'supertest';

import { app } from '../app';
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from '../test/helpers/database';
import { createImageFixture, createTextFixture } from '../test/helpers/files';

describe('mini car CRUD API', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it('creates a mini car record with an uploaded image', async () => {
    const imagePath = createImageFixture('create-car.png');

    const response = await request(app)
      .post('/api/minicars')
      .field('carBrand', 'Ford')
      .field('carModel', 'Mustang')
      .field('carYear', '1967')
      .field('miniBrand', 'Hot Wheels')
      .field('collection', 'Muscle Cars')
      .field('miniScale', '1:64')
      .attach('photo', imagePath);

    expect(response.status).toBe(201);
    expect(response.body.item.carBrand).toBe('Ford');
    expect(response.body.item.carModel).toBe('Mustang');
    expect(response.body.item.collection).toBe('Muscle Cars');
    expect(response.body.item.photoUrl).toMatch(
      /^http:\/\/localhost:5001\/uploads\/.+/
    );
  });

  it('creates a mini car record without an uploaded image', async () => {
    const response = await request(app)
      .post('/api/minicars')
      .field('carBrand', 'Ferrari')
      .field('carModel', 'F40')
      .field('carYear', '1987')
      .field('miniBrand', 'Hot Wheels')
      .field('miniScale', '1:64');

    expect(response.status).toBe(201);
    expect(response.body.item.carBrand).toBe('Ferrari');
    expect(response.body.item.photoFilename).toBeUndefined();
    expect(response.body.item.photoPath).toBeUndefined();
    expect(response.body.item.photoUrl).toBeUndefined();
  });

  it('lists records with pagination metadata', async () => {
    const imagePath = createImageFixture('list-car.png');

    await request(app)
      .post('/api/minicars')
      .field('carBrand', 'Chevrolet')
      .field('carModel', 'Camaro')
      .field('carYear', '1969')
      .field('miniBrand', 'Maisto')
      .field('miniScale', '1:24')
      .attach('photo', imagePath);

    const response = await request(app).get('/api/minicars?page=1&pageSize=10');

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.pagination.totalItems).toBe(1);
    expect(response.body.pagination.totalPages).toBe(1);
  });

  it('returns a single record by id', async () => {
    const imagePath = createImageFixture('get-car.png');

    const createResponse = await request(app)
      .post('/api/minicars')
      .field('carBrand', 'Porsche')
      .field('carModel', '911')
      .field('carYear', '1989')
      .field('miniBrand', 'Bburago')
      .field('collection', 'Porsche Shelf')
      .field('miniScale', '1:18')
      .attach('photo', imagePath);

    const response = await request(app).get(
      `/api/minicars/${createResponse.body.item.id}`
    );

    expect(response.status).toBe(200);
    expect(response.body.item.carBrand).toBe('Porsche');
    expect(response.body.item.collection).toBe('Porsche Shelf');
  });

  it('updates a record and replaces the image when a new file is uploaded', async () => {
    const originalImagePath = createImageFixture('update-original.png');
    const replacementImagePath = createImageFixture('update-replacement.png');

    const createResponse = await request(app)
      .post('/api/minicars')
      .field('carBrand', 'BMW')
      .field('carModel', 'M3')
      .field('carYear', '1990')
      .field('miniBrand', 'Auto World')
      .field('collection', 'DTM')
      .field('miniScale', '1:64')
      .attach('photo', originalImagePath);

    const originalPhotoPath = createResponse.body.item.photoPath as string;

    const response = await request(app)
      .put(`/api/minicars/${createResponse.body.item.id}`)
      .field('carBrand', 'BMW')
      .field('carModel', 'M3 Sport Evolution')
      .field('carYear', '1990')
      .field('miniBrand', 'Auto World')
      .field('collection', 'Legends')
      .field('miniScale', '1:64')
      .attach('photo', replacementImagePath);

    expect(response.status).toBe(200);
    expect(response.body.item.carModel).toBe('M3 Sport Evolution');
    expect(response.body.item.collection).toBe('Legends');
    expect(response.body.item.photoPath).not.toBe(originalPhotoPath);
  });

  it('deletes a record and removes its image from disk', async () => {
    const imagePath = createImageFixture('delete-car.png');

    const createResponse = await request(app)
      .post('/api/minicars')
      .field('carBrand', 'Nissan')
      .field('carModel', 'Skyline GT-R')
      .field('carYear', '1999')
      .field('miniBrand', 'Tomica')
      .field('miniScale', '1:64')
      .attach('photo', imagePath);

    const storedPhotoPath = createResponse.body.item.photoPath as string;

    const response = await request(app).delete(
      `/api/minicars/${createResponse.body.item.id}`
    );

    expect(response.status).toBe(204);
    expect(fs.existsSync(path.resolve(storedPhotoPath))).toBe(false);
  });

  it('rejects unsupported image types', async () => {
    const textPath = createTextFixture('invalid-upload.txt');

    const response = await request(app)
      .post('/api/minicars')
      .field('carBrand', 'Ford')
      .field('carModel', 'GT')
      .field('carYear', '2005')
      .field('miniBrand', 'Matchbox')
      .field('miniScale', '1:64')
      .attach('photo', textPath);

    expect(response.status).toBe(400);
    expect(response.body.error.message).toMatch(/image/i);
  });
});
