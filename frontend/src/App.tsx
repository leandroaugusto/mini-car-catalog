import { useState } from 'react';

import {
  createMiniCar,
  deleteMiniCar,
  fetchBrandSuggestions,
  fetchCollectionSuggestions,
  fetchMiniBrandSuggestions,
  fetchModelSuggestions,
  updateMiniCar,
} from './api/miniCars';
import { CatalogToolbar } from './components/CatalogToolbar';
import { MiniCarCards } from './components/MiniCarCards';
import { MiniCarForm } from './components/MiniCarForm';
import { MiniCarTable } from './components/MiniCarTable';
import { ViewToggle } from './components/ViewToggle';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useMiniCars } from './hooks/useMiniCars';
import { MiniCar, MiniCarFormValues } from './types/miniCar';

function getVisiblePages(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5;
  const halfWindow = Math.floor(maxVisiblePages / 2);
  const startPage = Math.max(
    1,
    Math.min(currentPage - halfWindow, totalPages - maxVisiblePages + 1)
  );
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
}

const VIEW_PREFERENCE_KEY = 'mini-car-catalog:view-preference';

export default function App() {
  const { items, loading, error, filters, pagination, setFilters, refresh } =
    useMiniCars();
  const [view, setView] = useLocalStorageState<'table' | 'cards'>(
    VIEW_PREFERENCE_KEY,
    'cards',
    {
      isValid: (value): value is 'table' | 'cards' =>
        value === 'table' || value === 'cards',
    }
  );
  const [editingItem, setEditingItem] = useState<MiniCar | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [itemPendingDelete, setItemPendingDelete] = useState<MiniCar | null>(
    null
  );

  async function handleSubmit(values: MiniCarFormValues) {
    if (editingItem) {
      await updateMiniCar(editingItem.id, values);
    } else {
      await createMiniCar(values);
    }

    setShowForm(false);
    setEditingItem(null);
    refresh();
  }

  function handleDelete(item: MiniCar) {
    setItemPendingDelete(item);
  }

  async function confirmDelete() {
    if (!itemPendingDelete) {
      return;
    }

    await deleteMiniCar(itemPendingDelete.id);
    setItemPendingDelete(null);
    refresh();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_30%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/85 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Collector Showroom
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Mini Car Catalog
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Keep your miniature collection elegant, searchable, and
                photo-first with a polished catalog built for collectors.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:items-end">
              <ViewToggle value={view} onChange={setView} />
              <div className="flex min-w-[18rem] justify-end">
                <div className="w-1/2 rounded-2xl bg-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {pagination.totalItems}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-8">
          <CatalogToolbar
            filters={filters}
            onChange={setFilters}
            onCreate={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          />

          {showForm ? (
            <MiniCarForm
              mode={editingItem ? 'edit' : 'create'}
              initialValues={
                editingItem
                  ? {
                      carBrand: editingItem.carBrand,
                      carModel: editingItem.carModel,
                      carYear: String(editingItem.carYear),
                      miniBrand: editingItem.miniBrand,
                      collection: editingItem.collection ?? '',
                      miniScale: editingItem.miniScale,
                      photo: null,
                      photoUrl: editingItem.photoUrl,
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
              fetchBrandSuggestions={fetchBrandSuggestions}
              fetchModelSuggestions={fetchModelSuggestions}
              fetchMiniBrandSuggestions={fetchMiniBrandSuggestions}
              fetchCollectionSuggestions={fetchCollectionSuggestions}
            />
          ) : null}

          {error ? (
            <div
              role="alert"
              className="rounded-[2rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <section className="space-y-5">
              <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="aspect-[4/3] animate-pulse bg-slate-200" />
                    <div className="space-y-3 p-5">
                      <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-6 w-2/3 animate-pulse rounded-full bg-slate-200" />
                      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {!loading && items.length === 0 ? (
            <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 px-6 py-16 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Empty Collection
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                Your showroom is ready for its first mini car
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Add your first collectible to start building a refined,
                searchable catalog.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(true);
                }}
                className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
              >
                Add Mini Car
              </button>
            </section>
          ) : null}

          {!loading && items.length > 0 && view === 'table' ? (
            <MiniCarTable
              items={items}
              onEdit={(item) => {
                setEditingItem(item);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ) : null}

          {!loading && items.length > 0 && view === 'cards' ? (
            <MiniCarCards
              items={items}
              onEdit={(item) => {
                setEditingItem(item);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ) : null}

          <nav
            aria-label="Pagination"
            className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white/90 px-5 py-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-slate-700">
                {pagination.totalItems} items
              </p>
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() =>
                  setFilters({ page: Math.max(1, filters.page - 1) })
                }
                disabled={filters.page <= 1}
              >
                Previous
              </button>
              {getVisiblePages(filters.page, pagination.totalPages).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                      pageNumber === filters.page
                        ? 'bg-slate-900 text-white shadow-sm disabled:cursor-default'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    onClick={() => setFilters({ page: pageNumber })}
                    disabled={pageNumber === filters.page}
                  >
                    {pageNumber}
                  </button>
                )
              )}
              <button
                type="button"
                className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={() =>
                  setFilters({
                    page: Math.min(
                      pagination.totalPages || 1,
                      filters.page + 1
                    ),
                  })
                }
                disabled={filters.page >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          </nav>
        </div>
      </div>

      {itemPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Delete Mini Car"
            className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-400">
              Delete Confirmation
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">
              Delete mini car?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This will permanently remove{' '}
              <span className="font-medium text-slate-900">
                {itemPendingDelete.carBrand} {itemPendingDelete.carModel}
              </span>{' '}
              from your catalog.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setItemPendingDelete(null)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-full border border-rose-200 bg-rose-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
