import { useQuery, useInfiniteQuery } from "@/libs/react-query";

import {
  SortType,
  type FilterDomains,
  type SearchParamSort,
} from "@/enum/meilisearch.enum";
import type { MeilisearchTemplateAttr } from "@/enum/template.enum";
import type {
  GetNewInLuminParams,
  TemplatePageData,
} from "@/interfaces/api.interface";
import { templatesApi, transformApiTemplate } from "@/services/templatesApi";
import { transformTemplate } from "@/utils/template-transformer";

export const useTemplates = (params: GetNewInLuminParams = {}) => {
  const {
    limit = 24,
    cursor = 0,
    filters = { formTypes: [], countries: [], states: [] },
    sort = [
      "outdated:asc",
      "totalUsed:desc",
      "publishedDateTimestamp:desc",
      "title:asc",
    ],
    skip = 0,
  } = params;

  return useQuery({
    queryKey: [
      "templates",
      "new-in-lumin",
      { limit, cursor, filters, sort, skip },
    ],
    queryFn: async () => {
      const response = await templatesApi.getNewInLumin({
        limit,
        cursor,
        filters,
        sort,
        skip,
      });

      return {
        templates: response.hits.map(transformApiTemplate),
        total: response.estimatedTotalHits,
        hasMore: response.offset + response.limit < response.estimatedTotalHits,
        ...response,
      };
    },
  });
};

export const useNewInLumin = (limit = 5) =>
  useTemplates({
    limit,
    cursor: 0,
    filters: { formTypes: [], countries: [], states: [] },
  });

export const useMostPopularInLumin = () =>
  useInfiniteQuery({
    queryKey: ["templates", "most-popular-in-lumin"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await templatesApi.getMostPopularInLumin({
        cursor: pageParam,
        limit: 12,
        filters: { formTypes: [], countries: [], states: [] },
      });

      return {
        templates: response.hits.map(transformApiTemplate),
        nextCursor:
          response.offset + response.limit < response.estimatedTotalHits
            ? pageParam + 1
            : undefined,
        hasMore: response.offset + response.limit < response.estimatedTotalHits,
        ...response,
      };
    },
    getNextPageParam: (lastPage: TemplatePageData) => lastPage.nextCursor,
    initialPageParam: 0,
  });

export const useSearchTemplates = (searchText: string, enabled = false) =>
  useInfiniteQuery({
    queryKey: ["templates", "search", searchText],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await templatesApi.searchTemplates({
        searchText,
        cursor: pageParam,
        limit: 24,
        filters: { formTypes: [], countries: [], states: [] },
        sort: ["relevantLocation:desc"],
      });

      return {
        templates: response.hits.map(transformApiTemplate),
        nextCursor:
          response.offset + response.limit < response.estimatedTotalHits
            ? response.offset + response.limit
            : undefined,
        hasMore: response.offset + response.limit < response.estimatedTotalHits,
        ...response,
      };
    },
    getNextPageParam: (lastPage: TemplatePageData) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: enabled && searchText.length > 0,
  });

const getAttributesToRetrieve = () =>
  [
    "id",
    "title",
    "totalUsed",
    "thumbnails.url",
    "thumbnails.alt",
    "accessible",
    "categories",
    "primaryIndustryCategory",
    "primaryTaskCategory",
  ] as `${MeilisearchTemplateAttr}`[];

export const useGetRelatedTemplatesBySlug = (params: {
  relatedFormIds: string[];
  filterFormTypeSlug?: string;
  templateSlug: string;
  domain?: FilterDomains;
  sort?: SearchParamSort[];
  relatedFormByDomain?: string[];
}) => {
  const {
    templateSlug,
    relatedFormIds = [],
    filterFormTypeSlug = "",
    domain,
    sort = SortType.MostPopular,
    relatedFormByDomain = [],
  } = params;

  return useQuery({
    queryKey: [
      "templates",
      "related",
      templateSlug,
      relatedFormIds,
      filterFormTypeSlug,
      "RelatedForms",
    ],
    queryFn: async () => {
      if (relatedFormIds.length || relatedFormByDomain.length) {
        return templatesApi.getRelatedTemplates({
          ids: relatedFormIds,
          domains: relatedFormByDomain,
          sort,
          attributesToRetrieve: getAttributesToRetrieve(),
        });
      }

      return templatesApi.getTemplatesByCategory({
        slug: filterFormTypeSlug,
        domain,
        sort,
        attributesToRetrieve: getAttributesToRetrieve(),
      });
    },
    select: (data: any) =>
      data
        .map(transformTemplate)
        .filter((item: any) => item.slug !== templateSlug)
        .slice(0, 5),
  });
};
