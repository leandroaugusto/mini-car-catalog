export interface MiniCarPayload {
  carBrand: string;
  carModel: string;
  carYear: number;
  miniBrand: string;
  collection?: string;
  miniScale: string;
}

export interface MiniCarListQuery {
  search?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  miniBrand?: string;
  collection?: string;
  miniScale?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
