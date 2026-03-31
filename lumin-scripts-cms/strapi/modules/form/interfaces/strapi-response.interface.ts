export interface IStrapiResponse {
  ok: boolean;
  status: number;
  error: {
    status?: number;
    message: string;
    details?: {
      errors: {
        path: string[];
        message: string;
        name: string;
      }[];
    };
  };
  data: {
    id: number;
  } | null;
}

export interface IUpdatePayload {
  tempUsedCount?: number;
  amountUsed?: number;
  categories?: number[];
  relatedForms?: number[];
  thumbnails?: number[];
  file?: number;
  timeSensitiveGrouping?: number;
  outdated?: boolean;
  published_at?: string;
  publishedAt?: string;
}
