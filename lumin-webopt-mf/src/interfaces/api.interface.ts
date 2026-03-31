export interface ApiTemplate {
  id: number;
  title: string;
  description: string;
  eSignCompatible: boolean;
  accessible: boolean;
  legalReview: boolean | null;
  totalUsed: number;
  outdated: boolean;
  slug: string;
  thumbnails: Array<{
    url: string;
    alt: string | null;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    parent: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  file: {
    id: number;
    name: string;
    url: string;
    ext: string;
    mime: string;
    size: number;
  };
}

export interface Template {
  id: string;
  title: string;
  usage: string;
  thumbnail: string;
  categories: string[];
  eSignCompatible: boolean;
  legalReview: boolean;
  accessible: boolean;
  fileUrl: string;
}

export interface TemplatesResponse {
  hits: ApiTemplate[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
  facetDistribution: Record<string, Record<string, number>>;
  facetStats: Record<string, unknown>;
}

export interface TemplatesFilters {
  formTypes?: string[];
  countries?: string[];
  states?: string[];
}

export interface SearchHit {
  title: string;
  searchTerms: string[];
  id: number;
  slug: string;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    parent: {
      id: number;
      name: string;
    };
  }>;
  _formatted: {
    title: string;
    searchTerms: string[];
    subTitle: string;
    description: string;
    id: string;
    slug: string;
    categories: Array<{
      id: string;
      name: string;
      slug: string;
      parent: {
        id: string;
        name: string;
      };
    }>;
  };
  _matchesPosition: Record<string, Array<{ start: number; length: number }>>;
  _rankingScore: number;
}

export interface SearchResult {
  indexUid: string;
  hits: SearchHit[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface GetNewInLuminParams {
  cursor?: number;
  limit?: number;
  filters?: TemplatesFilters;
  sort?: string[];
  skip?: number;
}

export interface SearchTemplatesParams {
  searchText: string;
  cursor?: number;
  limit?: number;
  filters?: TemplatesFilters;
  sort?: string[];
}

export interface TemplatePageData {
  templates: Template[];
  nextCursor?: number;
  hasMore: boolean;
}
