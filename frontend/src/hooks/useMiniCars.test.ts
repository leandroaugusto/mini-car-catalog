import { act, renderHook, waitFor } from '@testing-library/react';

import { fetchMiniCars } from '../api/miniCars';
import { useMiniCars } from './useMiniCars';

jest.mock('../api/miniCars', () => ({
  fetchMiniCars: jest.fn(),
}));

const mockedFetchMiniCars = jest.mocked(fetchMiniCars);
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((message?: unknown) => {
  if (
    typeof message === 'string' &&
    message.includes('inside a test was not wrapped in act')
  ) {
    return;
  }

  console.warn(message);
});

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
    window.localStorage.clear();
  });

  it('loads catalog data with 20 items per page by default', async () => {
    const { result } = renderHook(() => useMiniCars());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(mockedFetchMiniCars).toHaveBeenCalledWith(
        expect.objectContaining({ pageSize: 20, page: 1 })
      );
    });
  });

  it('loads catalog data with stored display preferences', async () => {
    window.localStorage.setItem(
      'mini-car-catalog:display-preferences',
      JSON.stringify({
        sortBy: 'carYear',
        sortOrder: 'asc',
        pageSize: 50,
      })
    );

    const { result } = renderHook(() => useMiniCars());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(mockedFetchMiniCars).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'carYear',
          sortOrder: 'asc',
          pageSize: 50,
          page: 1,
        })
      );
    });
  });

  it('persists updated display preferences', async () => {
    const { result } = renderHook(() => useMiniCars());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setFilters({
        sortBy: 'carBrand',
        sortOrder: 'asc',
        pageSize: 100,
      });
    });

    expect(window.localStorage.getItem('mini-car-catalog:display-preferences')).toBe(
      JSON.stringify({
        sortBy: 'carBrand',
        sortOrder: 'asc',
        pageSize: 100,
      })
    );
  });

  it('falls back to defaults when stored display preferences are invalid', async () => {
    window.localStorage.setItem(
      'mini-car-catalog:display-preferences',
      JSON.stringify({
        sortBy: 'other',
        sortOrder: 'sideways',
        pageSize: 7,
      })
    );

    const { result } = renderHook(() => useMiniCars());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(mockedFetchMiniCars).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'createdAt',
          sortOrder: 'desc',
          pageSize: 20,
        })
      );
    });
  });
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});
