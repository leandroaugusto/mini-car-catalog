export interface MiniCar {
  id: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  miniBrand: string;
  collection?: string;
  miniScale: string;
  photoFilename?: string;
  photoOriginalName?: string;
  photoPath?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MiniCarFilters {
  search: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  miniBrand: string;
  collection: string;
  miniScale: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface MiniCarFormValues {
  carBrand: string;
  carModel: string;
  carYear: string;
  miniBrand: string;
  collection: string;
  miniScale: string;
  photo: File | null;
  photoUrl?: string;
}
