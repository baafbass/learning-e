/** Paginated list returned by every list endpoint of the API. */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface PageQuery {
  page?: number;
  size?: number;
}
