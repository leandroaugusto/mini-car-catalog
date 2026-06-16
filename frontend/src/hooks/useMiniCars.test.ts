import { renderHook, waitFor } from '@testing-library/react';

import { fetchMiniCars } from '../api/miniCars';
import { useMiniCars } from './useMiniCars';

jest.mock('../api/miniCars', () => ({
  fetchMiniCars: jest.fn(),
}));

const mockedFetchMiniCars = jest.mocked(fetchMiniCars);

describe('useMiniCars', () => {
  beforeEach(() => {
    mockedFetchMiniCars.mockReset().mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 1,
      },
    });
  });

  it('loads catalog data with 20 items per page by default', async () => {
    renderHook(() => useMiniCars());

    await waitFor(() => {
      expect(mockedFetchMiniCars).toHaveBeenCalledWith(
        expect.objectContaining({ pageSize: 20, page: 1 })
      );
    });
  });
});
