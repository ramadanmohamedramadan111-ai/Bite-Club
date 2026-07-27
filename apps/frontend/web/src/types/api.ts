export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
