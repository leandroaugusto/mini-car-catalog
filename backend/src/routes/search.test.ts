import request from 'supertest';

import { app } from '../app';
import {
  clearTestDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from '../test/helpers/database';
import { createImageFixture } from '../test/helpers/files';

async function seedCars() {
  const mustangImage = await createImageFixture('search-mustang.png');
  const camaroImage = await createImageFixture('search-camaro.png');
  const porscheImage = await createImageFixture('search-porsche.png');

  await request(app)
    .post('/api/minicars')
    .field('carBrand', 'Ford')
    .field('carModel', 'Mustang')
    .field('carYear', '1967')
    .field('miniBrand', 'Hot Wheels')
    .field('collection', 'Muscle Cars')
    .field('miniScale', '1:64')
    .attach('photo', mustangImage);

  await request(app)
    .post('/api/minicars')
    .field('carBrand', 'Chevrolet')
    .field('carModel', 'Camaro')
    .field('carYear', '1969')
    .field('miniBrand', 'Maisto')
    .field('collection', 'Muscle Cars')
    .field('miniScale', '1:24')
    .attach('photo', camaroImage);

  await request(app)
    .post('/api/minicars')
    .field('carBrand', 'Porsche')
    .field('carModel', '911 Turbo')
    .field('carYear', '1989')
    .field('miniBrand', 'Bburago')
    .field('collection', 'European Classics')
    .field('miniScale', '1:18')
    .attach('photo', porscheImage);
}

describe('mini car search and autocomplete API', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  it('filters, sorts, and paginates the list response', async () => {
    await seedCars();

    const response = await request(app).get(
      '/api/minicars?carBrand=Ford&sortBy=carModel&sortOrder=asc&page=1&pageSize=5'
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].carBrand).toBe('Ford');
    expect(response.body.pagination.totalItems).toBe(1);
  });

  it('filters by collection when provided', async () => {
    await seedCars();

    const response = await request(app).get(
      '/api/minicars?collection=Muscle%20Cars&page=1&pageSize=10'
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items.every((item: { collection?: string }) => item.collection === 'Muscle Cars')).toBe(true);
  });

  it('returns distinct brand suggestions matching the query', async () => {
    await seedCars();

    const response = await request(app).get('/api/autocomplete/brands?q=fo');

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(['Ford']);
  });

  it('returns an empty list when the brand autocomplete query is blank', async () => {
    const response = await request(app).get('/api/autocomplete/brands?q=');

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });

  it('returns distinct mini brand suggestions matching the query', async () => {
    await seedCars();

    const response = await request(app).get('/api/autocomplete/mini-brands?q=ho');

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(['Hot Wheels']);
  });

  it('returns an empty list when the mini brand autocomplete query is blank', async () => {
    const response = await request(app).get('/api/autocomplete/mini-brands?q=');

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });

  it('returns distinct collection suggestions matching the query', async () => {
    await seedCars();

    const response = await request(app).get('/api/autocomplete/collections?q=mus');

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(['Muscle Cars']);
  });

  it('returns an empty list when the collection autocomplete query is blank', async () => {
    const response = await request(app).get('/api/autocomplete/collections?q=');

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });

  it('filters model suggestions by brand', async () => {
    await seedCars();

    const response = await request(app).get(
      '/api/autocomplete/models?q=mu&brand=Ford'
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(['Mustang']);
  });

  it('returns an empty list when model suggestions are missing brand or query', async () => {
    const missingBrand = await request(app).get('/api/autocomplete/models?q=mu');
    const missingQuery = await request(app).get('/api/autocomplete/models?brand=Ford');

    expect(missingBrand.status).toBe(200);
    expect(missingBrand.body.items).toEqual([]);
    expect(missingQuery.status).toBe(200);
    expect(missingQuery.body.items).toEqual([]);
  });
});
