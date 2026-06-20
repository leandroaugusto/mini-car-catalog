import { useCallback, useEffect, useState } from 'react';
import { useFormik } from 'formik';

import { MiniCarFormValues } from '../types/miniCar';
import { fetchYearSuggestions } from '../utils/yearOptions';
import { createMiniCarSchema } from '../validation/miniCarSchema';
import { AutocompleteInput } from './AutocompleteInput';
import { ImageInput } from './ImageInput';

const MINI_SCALE_OPTIONS = [
  '1:87',
  '1:64',
  '1:43',
  '1:32',
  '1:24',
  '1:18',
] as const;

interface MiniCarFormProps {
  mode: 'create' | 'edit';
  initialValues?: MiniCarFormValues;
  onSubmit: (values: MiniCarFormValues) => Promise<void> | void;
  onCancel: () => void;
  fetchBrandSuggestions: (query: string) => Promise<string[]>;
  fetchModelSuggestions: (query: string, brand: string) => Promise<string[]>;
  fetchMiniBrandSuggestions: (query: string) => Promise<string[]>;
  fetchCollectionSuggestions: (query: string) => Promise<string[]>;
}

const defaultValues: MiniCarFormValues = {
  carBrand: '',
  carModel: '',
  carYear: '',
  miniBrand: '',
  collection: '',
  miniScale: '',
  photo: null,
  photoUrl: '',
};

export function MiniCarForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  fetchBrandSuggestions,
  fetchModelSuggestions,
  fetchMiniBrandSuggestions,
  fetchCollectionSuggestions,
}: MiniCarFormProps) {
  const [previewUrl, setPreviewUrl] = useState(initialValues?.photoUrl ?? '');
  const formik = useFormik<MiniCarFormValues>({
    initialValues: initialValues ?? defaultValues,
    enableReinitialize: true,
    validationSchema: createMiniCarSchema(mode),
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const showError = (fieldName: keyof MiniCarFormValues) =>
    (formik.touched[fieldName] || formik.submitCount > 0) &&
    formik.errors[fieldName]
      ? String(formik.errors[fieldName])
      : undefined;

  const inputClassName =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-200';
  const labelClassName = 'mb-2 block text-sm font-medium text-slate-700';
  const fetchCarModelSuggestions = useCallback(
    (query: string) => fetchModelSuggestions(query, formik.values.carBrand),
    [fetchModelSuggestions, formik.values.carBrand]
  );

  useEffect(() => {
    if (formik.values.photo) {
      const objectUrl = URL.createObjectURL(formik.values.photo);
      setPreviewUrl(objectUrl);

      return () => {
        if (typeof URL.revokeObjectURL === 'function') {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }

    setPreviewUrl(formik.values.photoUrl ?? '');
    return undefined;
  }, [formik.values.photo, formik.values.photoUrl]);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {mode === 'edit' ? 'Update Record' : 'New Record'}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {mode === 'edit' ? 'Edit your mini car' : 'Add a new mini car'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your collection polished with clean metadata and a strong
            photo.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <AutocompleteInput
            id="carBrand"
            name="carBrand"
            label="Car Brand"
            value={formik.values.carBrand}
            onBlur={() => formik.setFieldTouched('carBrand', true)}
            onChange={(value) => {
              if (value !== formik.values.carBrand) {
                formik.setFieldValue('carBrand', value);
                formik.setFieldValue('carModel', '');
              }
            }}
            fetchSuggestions={fetchBrandSuggestions}
            error={showError('carBrand')}
            placeholder="Ferrari, Ford, Porsche..."
          />

          <AutocompleteInput
            id="carModel"
            name="carModel"
            label="Car Model"
            value={formik.values.carModel}
            onBlur={() => formik.setFieldTouched('carModel', true)}
            onChange={(value) => formik.setFieldValue('carModel', value)}
            fetchSuggestions={fetchCarModelSuggestions}
            disabled={!formik.values.carBrand}
            error={showError('carModel')}
            placeholder="Mustang, 911 Turbo..."
          />

          <AutocompleteInput
            id="carYear"
            name="carYear"
            label="Car Year"
            value={
              formik.values.carYear === '' ? '' : String(formik.values.carYear)
            }
            onBlur={() => formik.setFieldTouched('carYear', true)}
            onChange={(value) => formik.setFieldValue('carYear', value)}
            fetchSuggestions={fetchYearSuggestions}
            error={showError('carYear')}
            placeholder="Search a year from 1900 onward..."
            minQueryLength={1}
          />

          <AutocompleteInput
            id="miniBrand"
            name="miniBrand"
            label="Mini Brand"
            value={formik.values.miniBrand}
            onBlur={() => formik.setFieldTouched('miniBrand', true)}
            onChange={(value) => formik.setFieldValue('miniBrand', value)}
            fetchSuggestions={fetchMiniBrandSuggestions}
            error={showError('miniBrand')}
            placeholder="Hot Wheels, Maisto, Bburago..."
          />

          <AutocompleteInput
            id="collection"
            name="collection"
            label="Collection"
            value={formik.values.collection}
            onBlur={() => formik.setFieldTouched('collection', true)}
            onChange={(value) => formik.setFieldValue('collection', value)}
            fetchSuggestions={fetchCollectionSuggestions}
            error={showError('collection')}
            placeholder="Movie Cars, Muscle Cars, Rally Legends..."
          />

          <div>
            <label htmlFor="miniScale" className={labelClassName}>
              Mini Scale
            </label>
            <select
              id="miniScale"
              name="miniScale"
              className={inputClassName}
              value={formik.values.miniScale}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            >
              <option value="">Select a scale</option>
              {MINI_SCALE_OPTIONS.map((scaleOption) => (
                <option key={scaleOption} value={scaleOption}>
                  {scaleOption}
                </option>
              ))}
            </select>
            {showError('miniScale') ? (
              <div role="alert" className="mt-2 text-sm text-rose-600">
                {showError('miniScale')}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <ImageInput
            id="photo"
            label="Photo"
            onChange={(file) => formik.setFieldValue('photo', file)}
            error={showError('photo')}
          />

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">
              Current preview
            </p>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Current mini car"
                  className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                  Photo preview appears here
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
