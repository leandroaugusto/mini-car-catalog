import { useState } from 'react';

import {
  fetchBrandSuggestions,
  fetchCollectionSuggestions,
  fetchMiniBrandSuggestions,
  fetchModelSuggestions,
} from '../api/miniCars';
import { MiniCarFilters } from '../types/miniCar';
import { fetchYearSuggestions } from '../utils/yearOptions';
import { AutocompleteInput } from './AutocompleteInput';

interface CatalogToolbarProps {
  filters: MiniCarFilters;
  onChange: (changes: Partial<MiniCarFilters>) => void;
  onCreate: () => void;
}

const MINI_SCALE_OPTIONS = [
  '1:87',
  '1:64',
  '1:43',
  '1:32',
  '1:24',
  '1:18',
] as const;

export function CatalogToolbar({
  filters,
  onChange,
  onCreate,
}: CatalogToolbarProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const inputClassName =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const labelClassName =
    'mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500';
  const clearButtonClassName =
    'absolute inset-y-0 right-3 my-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700';

  function renderTextInput(
    id: string,
    label: string,
    value: string,
    onValueChange: (value: string) => void,
    placeholder?: string
  ) {
    return (
      <div>
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            value={value}
            placeholder={placeholder}
            className={`${inputClassName} ${value ? 'pr-12' : ''}`}
            onChange={(event) => onValueChange(event.target.value)}
          />
          {value ? (
            <button
              type="button"
              aria-label={`Clear ${label}`}
              className={clearButtonClassName}
              onMouseDown={(event) => {
                event.preventDefault();
                onValueChange('');
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Actions
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Manage collection
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a new mini car to your showroom whenever you find your next
              piece.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFiltersExpanded(false);
              onCreate();
            }}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            Add Mini Car
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/90 shadow-sm backdrop-blur">
        <button
          type="button"
          aria-expanded={filtersExpanded}
          aria-controls="catalog-filters-panel"
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          onClick={() => setFiltersExpanded((current) => !current)}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Catalog Filters
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Refine your collection
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search your display pieces by car details, brand, year, or scale.
            </p>
          </div>
          <span
            aria-hidden="true"
            className={`text-2xl text-slate-400 transition-transform ${
              filtersExpanded ? 'rotate-180' : ''
            }`}
          >
            ˅
          </span>
        </button>

        {filtersExpanded ? (
          <div
            id="catalog-filters-panel"
            className="border-t border-slate-100 px-6 pb-6 pt-5"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                {renderTextInput(
                  'search',
                  'Search',
                  filters.search,
                  (value) => onChange({ search: value }),
                  'Try Mustang, Porsche, Hot Wheels...'
                )}
              </div>

              <AutocompleteInput
                id="carBrandFilter"
                name="carBrandFilter"
                label="Car Brand"
                value={filters.carBrand}
                onBlur={() => undefined}
                onChange={(value) =>
                  onChange({ carBrand: value, carModel: '' })
                }
                fetchSuggestions={fetchBrandSuggestions}
                placeholder="Ferrari, Ford, Porsche..."
              />

              <AutocompleteInput
                id="carModelFilter"
                name="carModelFilter"
                label="Car Model"
                value={filters.carModel}
                onBlur={() => undefined}
                onChange={(value) => onChange({ carModel: value })}
                fetchSuggestions={(query) =>
                  fetchModelSuggestions(query, filters.carBrand)
                }
                disabled={!filters.carBrand}
                placeholder="Mustang, 911 Turbo..."
              />

              <AutocompleteInput
                id="carYearFilter"
                name="carYearFilter"
                label="Car Year"
                value={filters.carYear}
                onBlur={() => undefined}
                onChange={(value) => onChange({ carYear: value })}
                fetchSuggestions={fetchYearSuggestions}
                placeholder="Search from 1900 onward..."
                minQueryLength={1}
              />

              <AutocompleteInput
                id="miniBrandFilter"
                name="miniBrandFilter"
                label="Mini Brand"
                value={filters.miniBrand}
                onBlur={() => undefined}
                onChange={(value) => onChange({ miniBrand: value })}
                fetchSuggestions={fetchMiniBrandSuggestions}
                placeholder="Hot Wheels, Maisto, Bburago..."
              />

              <AutocompleteInput
                id="collectionFilter"
                name="collectionFilter"
                label="Collection"
                value={filters.collection}
                onBlur={() => undefined}
                onChange={(value) => onChange({ collection: value })}
                fetchSuggestions={fetchCollectionSuggestions}
                placeholder="Movie Cars, Muscle Cars, Rally Legends..."
              />

              <div>
                <label htmlFor="miniScaleFilter" className={labelClassName}>
                  Mini Scale
                </label>
                <select
                  id="miniScaleFilter"
                  value={filters.miniScale}
                  className={inputClassName}
                  onChange={(event) =>
                    onChange({ miniScale: event.target.value })
                  }
                >
                  <option value="">All scales</option>
                  {MINI_SCALE_OPTIONS.map((scaleOption) => (
                    <option key={scaleOption} value={scaleOption}>
                      {scaleOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Catalog Display
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            Catalog Display
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Control how your catalog is ordered and how many items appear per
            page.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="sortBy" className={labelClassName}>
              Sort By
            </label>
            <select
              id="sortBy"
              value={filters.sortBy}
              className={inputClassName}
              onChange={(event) => onChange({ sortBy: event.target.value })}
            >
              <option value="createdAt">Created</option>
              <option value="carBrand">Car Brand</option>
              <option value="carModel">Car Model</option>
              <option value="carYear">Car Year</option>
              <option value="miniBrand">Mini Brand</option>
              <option value="miniScale">Mini Scale</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className={labelClassName}>
              Sort Order
            </label>
            <select
              id="sortOrder"
              value={filters.sortOrder}
              className={inputClassName}
              onChange={(event) =>
                onChange({ sortOrder: event.target.value as 'asc' | 'desc' })
              }
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div>
            <label htmlFor="pageSize" className={labelClassName}>
              Items Per Page
            </label>
            <select
              id="pageSize"
              value={String(filters.pageSize)}
              className={inputClassName}
              onChange={(event) =>
                onChange({ pageSize: Number(event.target.value), page: 1 })
              }
            >
              <option value="20">20 items</option>
              <option value="50">50 items</option>
              <option value="100">100 items</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}
