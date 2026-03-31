import { templatesApiClient } from "@/libs/axios";

import { LUMIN_TEMPLATES_API_ROUTES } from "@/constants/apiRoutes";
import type {
  ApiTemplate,
  Template,
  TemplatesResponse,
  SearchResponse,
  GetNewInLuminParams,
  SearchTemplatesParams,
} from "@/interfaces/api.interface";
import type { TemplateInput } from "@/interfaces/template-input.interface";
import { formatUsageCount, USAGE_OFFSET } from "@/utils/formatUsage";

export const transformApiTemplate = (apiTemplate: ApiTemplate): Template => ({
  id: apiTemplate.id.toString(),
  title: apiTemplate.title,
  usage: formatUsageCount((apiTemplate.totalUsed ?? 0) + USAGE_OFFSET),
  thumbnail: apiTemplate.thumbnails?.[0]?.url || "",
  categories: apiTemplate.categories?.map((cat) => cat.name) || [],
  eSignCompatible: apiTemplate.eSignCompatible,
  legalReview: apiTemplate.legalReview ?? false,
  accessible: apiTemplate.accessible,
  fileUrl: apiTemplate.file?.url || "",
});

export const templatesApi = {
  getNewInLumin: async (
    params: GetNewInLuminParams = {},
  ): Promise<TemplatesResponse> => {
    const {
      cursor = 0,
      limit = 24,
      filters = { formTypes: [], countries: [], states: [] },
      sort = [
        "outdated:asc",
        "totalUsed:desc",
        "publishedDateTimestamp:desc",
        "title:asc",
      ],
      skip = 0,
    } = params;

    const response = await templatesApiClient.get(
      LUMIN_TEMPLATES_API_ROUTES.NewInLumin,
      {
        params: {
          cursor,
          filters: JSON.stringify(filters),
          limit,
          sort: JSON.stringify(sort),
          skip,
        },
      },
    );

    return response.data;
  },

  getMostPopularInLumin: async (
    params: GetNewInLuminParams = {},
  ): Promise<TemplatesResponse> => {
    const {
      cursor = 0,
      limit = 12,
      filters = { formTypes: [], countries: [], states: [] },
      sort = [
        "outdated:asc",
        "totalUsed:desc",
        "publishedDateTimestamp:desc",
        "title:asc",
      ],
    } = params;

    const requestParams = {
      cursor,
      filters: JSON.stringify(filters),
      limit,
      sort: JSON.stringify(sort),
    };

    const response = await templatesApiClient.get(
      LUMIN_TEMPLATES_API_ROUTES.MostPopularInLumin,
      {
        params: requestParams,
      },
    );

    return response.data;
  },

  search: async (searchText: string): Promise<SearchResponse> => {
    const response = await templatesApiClient.get(
      LUMIN_TEMPLATES_API_ROUTES.Search,
      {
        params: {
          searchText,
        },
      },
    );

    return response.data;
  },

  searchTemplates: async (
    params: SearchTemplatesParams,
  ): Promise<TemplatesResponse> => {
    const {
      searchText,
      cursor = 0,
      limit = 24,
      filters = { formTypes: [], countries: [], states: [] },
      sort = ["relevantLocation:desc"],
    } = params;

    const response = await templatesApiClient.get(
      LUMIN_TEMPLATES_API_ROUTES.SearchTemplates,
      {
        params: {
          searchText,
          cursor,
          filters: JSON.stringify(filters),
          limit,
          sort: JSON.stringify(sort),
        },
      },
    );

    return response.data;
  },

  getTemplateById: async (
    templateId: number,
  ): Promise<{ template: TemplateInput }> => {
    const response = await templatesApiClient.get(
      `${LUMIN_TEMPLATES_API_ROUTES.GetTemplateById}/${templateId}`,
    );
    return response.data;
  },

  getRelatedTemplates: async (params: {
    ids: string[];
    domains: string[];
    sort?: any[];
    attributesToRetrieve?: string[];
  }): Promise<any> => {
    const { ids, domains, sort, attributesToRetrieve } = params;
    const response = await templatesApiClient.get(
      LUMIN_TEMPLATES_API_ROUTES.Related,
      {
        params: {
          ids: JSON.stringify(ids),
          sort: JSON.stringify(sort),
          relatedFormByDomain: JSON.stringify(domains),
          attributesToRetrieve,
        },
      },
    );
    return response.data.hits;
  },

  getTemplatesByCategory: async (params: {
    slug: string;
    domain?: any;
    sort?: any[];
    limit?: number;
    attributesToRetrieve?: string[];
  }): Promise<any> => {
    const { slug, domain, sort, limit = 6, attributesToRetrieve } = params;
    const response = await templatesApiClient.get(
      `${LUMIN_TEMPLATES_API_ROUTES.Category}/${slug}`,
      {
        params: {
          limit,
          sort: JSON.stringify(sort),
          filters: JSON.stringify({ domain }),
          attributesToRetrieve,
        },
      },
    );
    return response.data.hits;
  },
};
