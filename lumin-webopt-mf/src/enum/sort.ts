export enum SortKeys {
  MostRelevant = "mostRelevant",
  MostRelevantGeo = "mostRelevantGeo",
  MostRelevantType1 = "mostRelevantType1",
  MostRelevantType2 = "mostRelevantType2",
  MostPopular = "mostPopular",
  MostRecent = "mostRecent",
  ASC = "asc",
}

export const COLLECTION_PAGE_ASC_SORT = "A-Z";

export const SortTitles = {
  [SortKeys.MostRelevant]: "Most relevant",
  [SortKeys.MostRelevantGeo]: "Most relevant",
  [SortKeys.MostRelevantType1]: "Most relevant",
  [SortKeys.MostRelevantType2]: "Most relevant",
  [SortKeys.MostPopular]: "Most popular",
  [SortKeys.MostRecent]: "Most recent",
  [SortKeys.ASC]: "A to Z",
};

const CommonSort = [SortKeys.MostPopular, SortKeys.MostRecent, SortKeys.ASC];

/**
 * Default sorting for SearchResultPage and CategoryPage when Localization feature is disabled.
 */
export const SortCategoryPage = [...CommonSort];
export const SortHomepageMobile = [...CommonSort];
export const SortSearchResultPage = [SortKeys.MostRelevant, ...CommonSort];

/**
 * Sorting for SearchResultPage and CategoryPage when Localization feature is enabled.
 * @description Follow this specs: https://lumin.atlassian.net/wiki/spaces/LT/pages/1371963572/Filter+Sort
 */
export const SortSearchResultPageGeo = [
  SortKeys.MostRelevantGeo,
  ...CommonSort,
];
