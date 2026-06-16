import { parseListQuery } from './miniCar';

describe('parseListQuery', () => {
  it('allows 100 items per page', () => {
    const query = parseListQuery({ pageSize: '100' });

    expect(query.pageSize).toBe(100);
  });
});
