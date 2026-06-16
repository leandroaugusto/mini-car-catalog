import { MiniCar, MiniCarFilters, MiniCarFormValues, PaginationState } from '../types/miniCar';
import { requestJson } from './client';

interface ListResponse {
  items: MiniCar[];
  pagination: PaginationState;
}

function buildQuery(filters: MiniCarFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

function buildFormData(values: MiniCarFormValues) {
  const formData = new FormData();
  formData.set('carBrand', values.carBrand);
  formData.set('carModel', values.carModel);
  formData.set('carYear', String(values.carYear));
  formData.set('miniBrand', values.miniBrand);
  formData.set('collection', values.collection);
  formData.set('miniScale', values.miniScale);

  if (values.photo) {
    formData.set('photo', values.photo);
  }

  return formData;
}

export async function fetchMiniCars(filters: MiniCarFilters): Promise<ListResponse> {
  const query = buildQuery(filters);
  return requestJson<ListResponse>(`/minicars?${query}`);
}

export async function createMiniCar(values: MiniCarFormValues) {
  return requestJson<{ item: MiniCar }>('/minicars', {
    method: 'POST',
    body: buildFormData(values),
  });
}

export async function updateMiniCar(id: string, values: MiniCarFormValues) {
  return requestJson<{ item: MiniCar }>(`/minicars/${id}`, {
    method: 'PUT',
    body: buildFormData(values),
  });
}

export async function deleteMiniCar(id: string) {
  await fetch(`http://localhost:5000/api/minicars/${id}`, { method: 'DELETE' });
}

export async function fetchBrandSuggestions(query: string) {
  const response = await requestJson<{ items: string[] }>(
    `/autocomplete/brands?q=${encodeURIComponent(query)}`
  );
  return response.items;
}

export async function fetchModelSuggestions(query: string, brand: string) {
  const response = await requestJson<{ items: string[] }>(
    `/autocomplete/models?q=${encodeURIComponent(query)}&brand=${encodeURIComponent(brand)}`
  );
  return response.items;
}

export async function fetchMiniBrandSuggestions(query: string) {
  const response = await requestJson<{ items: string[] }>(
    `/autocomplete/mini-brands?q=${encodeURIComponent(query)}`
  );
  return response.items;
}

export async function fetchCollectionSuggestions(query: string) {
  const response = await requestJson<{ items: string[] }>(
    `/autocomplete/collections?q=${encodeURIComponent(query)}`
  );
  return response.items;
}
