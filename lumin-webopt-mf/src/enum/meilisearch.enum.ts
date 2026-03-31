export enum SearchParamSort {
  TotalUsedAsc = "totalUsed:asc",
  TotalUsedDesc = "totalUsed:desc",

  PublishedDateTimestampAsc = "publishedDateTimestamp:asc",
  PublishedDateTimestampDesc = "publishedDateTimestamp:desc",

  TitleAsc = "title:asc",
  TitleDesc = "title:desc",

  NameAsc = "name:asc",
  NameDesc = "name:desc",

  /** False -> True */
  OutdatedAsc = "outdated:asc",

  /**
   * luminpdf.com: 1
   * others domain: 0
   */
  DomainIndexAsc = "domainIndex:asc",
  DomainIndexDesc = "domainIndex:desc",

  /**
   * for sort relevant only
   * This is not a built-in rule in MeiliSearch
   */
  RelevantLocationDesc = "relevantLocation:desc",
}

/**
 * @description Follow this specs https://lumin.atlassian.net/wiki/spaces/LT/pages/1371963572/Filter+Sort
 */
export const SortType = {
  MostPopular: [
    SearchParamSort.OutdatedAsc,
    SearchParamSort.TotalUsedDesc,
    SearchParamSort.PublishedDateTimestampDesc,
    SearchParamSort.TitleAsc,
  ],
  MostRelevant: [],
  MostRelevantGeo: [SearchParamSort.RelevantLocationDesc],
  MostRelevantType1: [
    SearchParamSort.RelevantLocationDesc,
    SearchParamSort.OutdatedAsc,
    SearchParamSort.TotalUsedDesc,
    SearchParamSort.PublishedDateTimestampDesc,
    SearchParamSort.TitleAsc,
  ],
  MostRelevantType2: [
    SearchParamSort.RelevantLocationDesc,
    SearchParamSort.OutdatedAsc,
    SearchParamSort.PublishedDateTimestampDesc,
    SearchParamSort.TotalUsedDesc,
    SearchParamSort.TitleAsc,
  ],
  MostRecent: [
    SearchParamSort.OutdatedAsc,
    SearchParamSort.PublishedDateTimestampDesc,
    SearchParamSort.TotalUsedDesc,
    SearchParamSort.TitleAsc,
  ],
  TitleAsc: [SearchParamSort.OutdatedAsc, SearchParamSort.TitleAsc],
};

export enum FilterDomains {
  LuminPDF = "luminpdf.com",
  IRS = "irs.gov",
  IRD = "ird.govt.nz",
}

export enum TopLevelCategory {
  FormTypeFilter = "Form Type Filter",
  Task = "Task",
  Industry = "Industry",
}

export enum PrimaryCategoriesSlug {
  FormTypeFilter = "form-type-filter",
  Task = "task",
  Industry = "industry",
}

export enum FormTypeFilterName {
  Others = "Others",
}

export enum FilterKeyValue {
  Others = "others",
}

export enum HeaderKey {
  Region = "cf-region",
  StateCode = "cf-region-code",
  CountryCode = "cf-ipcountry",
  Latitude = "cf-iplatitude",
  Longitude = "cf-iplongitude",
}

export const START_OF_FILTER_DAY = "2022 July 01";

export enum FileNavigation {
  Editor = "Editor",
  AG = "AG",
}

/**
 * Base filter for form queries in Meilisearch.
 * Filters to only include templates that are available for querying.
 * @see {@link https://lumin.atlassian.net/browse/LT-2686|LT-12686}
 */
export const MEILISEARCH_BASE_FILTER_TEMPLATE = "availableForQuery=true";
