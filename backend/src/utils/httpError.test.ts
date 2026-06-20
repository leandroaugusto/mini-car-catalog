import { HttpError } from './httpError';

describe('HttpError', () => {
  it('stores the status code and message', () => {
    const error = new HttpError(422, 'Validation failed');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HttpError');
    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(422);
  });
});
