export interface DataWrapper<T> {
  data: T[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface Meta {
  pagination: PaginationMeta;
}

export interface IStrapiApiResponse<T> {
  data: T[];
  meta: Meta;
}
