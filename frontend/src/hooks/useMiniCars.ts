import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchMiniCars } from '../api/miniCars';
import { MiniCar, MiniCarFilters, PaginationState } from '../types/miniCar';
import { useLocalStorageState } from './useLocalStorageState';

const initialFilters: MiniCarFilters = {
  search: '',
  carBrand: '',
  carModel: '',
  carYear: '',
  miniBrand: '',
  collection: '',
  miniScale: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 20,
};

const initialPagination: PaginationState = {
  page: 1,
  pageSize: 20,
  totalItems: 0,
  totalPages: 1,
};

const DISPLAY_PREFERENCES_KEY = 'mini-car-catalog:display-preferences';
const DEFAULT_DISPLAY_PREFERENCES = {
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
  pageSize: 20,
};
const ALLOWED_SORT_FIELDS = new Set([
  'createdAt',
  'carBrand',
  'carModel',
  'carYear',
  'miniBrand',
  'miniScale',
]);

type DisplayPreferences = Pick<
  MiniCarFilters,
  'sortBy' | 'sortOrder' | 'pageSize'
>;

function isValidDisplayPreferences(
  value: unknown
): value is DisplayPreferences {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<DisplayPreferences>;

  return (
    typeof candidate.sortBy === 'string' &&
    ALLOWED_SORT_FIELDS.has(candidate.sortBy) &&
    (candidate.sortOrder === 'asc' || candidate.sortOrder === 'desc') &&
    (candidate.pageSize === 20 ||
      candidate.pageSize === 50 ||
      candidate.pageSize === 100)
  );
}

export function useMiniCars() {
  const [displayPreferences, setDisplayPreferences] =
    useLocalStorageState<DisplayPreferences>(
      DISPLAY_PREFERENCES_KEY,
      DEFAULT_DISPLAY_PREFERENCES,
      { isValid: isValidDisplayPreferences }
    );
  const [items, setItems] = useState<MiniCar[]>([]);
  const [filters, setFiltersState] = useState<MiniCarFilters>(() => ({
    ...initialFilters,
    ...displayPreferences,
  }));
  const [pagination, setPagination] =
    useState<PaginationState>(initialPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (
      displayPreferences.sortBy !== filters.sortBy ||
      displayPreferences.sortOrder !== filters.sortOrder ||
      displayPreferences.pageSize !== filters.pageSize
    ) {
      setDisplayPreferences({
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        pageSize: filters.pageSize,
      });
    }
  }, [
    displayPreferences,
    filters.pageSize,
    filters.sortBy,
    filters.sortOrder,
    setDisplayPreferences,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadMiniCars() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchMiniCars(filters);

        if (!cancelled) {
          setItems(result.items);
          setPagination(result.pagination);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Failed to load catalog'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMiniCars();

    return () => {
      cancelled = true;
    };
  }, [filters, refreshToken]);

  const setFilters = useCallback((nextFilters: Partial<MiniCarFilters>) => {
    setFiltersState((current) => ({
      ...current,
      ...nextFilters,
      page: nextFilters.page ?? 1,
    }));
  }, []);

  const refresh = useCallback(() => {
    setRefreshToken((current) => current + 1);
  }, []);

  return useMemo(
    () => ({
      items,
      loading,
      error,
      filters,
      pagination,
      setFilters,
      refresh,
    }),
    [error, filters, items, loading, pagination, refresh, setFilters]
  );
}
