// Types de base pour les réponses API
export interface ApiResponse<T = any> {
  meta: {
    status: number;
    message: string;
  };
  data: T;
  error?: any;
}

export interface PaginationMeta {
  perpage: number;
  prevPage: number | null;
  currentPage: number;
  nextPage: number | null;
  totalPage: number;
  total: number;
}
