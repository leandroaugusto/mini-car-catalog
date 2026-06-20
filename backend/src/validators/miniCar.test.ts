import { HttpError } from '../utils/httpError';
import { parseListQuery, validateMiniCarPayload } from './miniCar';

describe('parseListQuery', () => {
  it('allows 100 items per page', () => {
    const query = parseListQuery({ pageSize: '100' });

    expect(query.pageSize).toBe(100);
  });

  it('trims string filters and falls back to desc sort order', () => {
    const query = parseListQuery({
      search: '  ford  ',
      collection: '  Muscle Cars  ',
      sortOrder: 'unexpected',
    });

    expect(query.search).toBe('ford');
    expect(query.collection).toBe('Muscle Cars');
    expect(query.sortOrder).toBe('desc');
  });
});

describe('validateMiniCarPayload', () => {
  const validPayload = {
    carBrand: ' Ford ',
    carModel: ' Mustang ',
    carYear: '1967',
    miniBrand: ' Hot Wheels ',
    collection: ' Muscle Cars ',
    miniScale: '1:64',
  };

  it('trims required and optional fields', () => {
    const payload = validateMiniCarPayload(validPayload, {
      photoRequired: false,
      hasPhoto: false,
    });

    expect(payload).toEqual({
      carBrand: 'Ford',
      carModel: 'Mustang',
      carYear: 1967,
      miniBrand: 'Hot Wheels',
      collection: 'Muscle Cars',
      miniScale: '1:64',
    });
  });

  it('rejects invalid car years', () => {
    expect(() =>
      validateMiniCarPayload(
        { ...validPayload, carYear: '1899' },
        { photoRequired: false, hasPhoto: false }
      )
    ).toThrow(new HttpError(400, 'Car year must be a valid year'));
  });

  it('rejects invalid scales', () => {
    expect(() =>
      validateMiniCarPayload(
        { ...validPayload, miniScale: '64' },
        { photoRequired: false, hasPhoto: false }
      )
    ).toThrow(new HttpError(400, 'Mini scale must use the format 1:64'));
  });

  it('requires a photo when the option is enabled', () => {
    expect(() =>
      validateMiniCarPayload(validPayload, {
        photoRequired: true,
        hasPhoto: false,
      })
    ).toThrow(new HttpError(400, 'Photo is required'));
  });

  it('drops blank optional collection values', () => {
    const payload = validateMiniCarPayload(
      { ...validPayload, collection: '   ' },
      { photoRequired: false, hasPhoto: false }
    );

    expect(payload.collection).toBeUndefined();
  });
});
