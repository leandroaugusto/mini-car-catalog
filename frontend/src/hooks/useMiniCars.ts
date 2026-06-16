import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchMiniCars } from '../api/miniCars';
import { MiniCar, MiniCarFilters, PaginationState } from '../types/miniCar';

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

export function useMiniCars() {
  const [items, setItems] = useState<MiniCar[]>([]);
  const [filters, setFiltersState] = useState<MiniCarFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

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
            requestError instanceof Error ? requestError.message : 'Failed to load catalog'
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

  const setFilters = useCallback(
    (nextFilters: Partial<MiniCarFilters>) => {
      setFiltersState((current) => ({
        ...current,
        ...nextFilters,
        page: nextFilters.page ?? 1,
      }));
    },
    []
  );

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
