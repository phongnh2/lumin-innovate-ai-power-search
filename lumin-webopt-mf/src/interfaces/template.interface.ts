import { type BlocksContent } from "@strapi/blocks-react-renderer";

import { FileNavigation, FilterDomains } from "@/enum/meilisearch.enum";
import type { SearchResultType } from "@/enum/search-type.enum";

import type { ICategory } from "./category.interface";
import type { ICollectionPage } from "./collection-page.interface";
import type { IFile, IThumbnail } from "./thumbnail.interface";
import type { ITrustIndicator } from "./trustIndicator.interface";

export interface ITemplateOwner {
  link?: string;
}

export interface IVariation {
  id: number;
  variationIdentifier: string;
  thumbnails: IThumbnail[];
}

export interface ITemplateTimeSensitiveGrouping {
  id: string;
  title: string;
  slug: string;
  mainThumbnail: {
    url: string;
    alt?: string;
  };
  totalUsed: string;
  totalUsedNumber: string;
  publishedDate: string;
  eSignCompatible: boolean;
  fileUrl: string;
  categoryNames: string;
  fileNavigation: FileNavigation;
  outdated: boolean;
  legalReview: boolean;
  timeSensitiveSlug?: string;
}

export enum LegalReviewRole {
  Draft = "Draft",
  Review = "Review",
  DraftAndReview = "Draft & Review",
}

export interface ITemplate {
  id: number;
  title: string;
  subTitle: string;
  description: string;
  slug: string;
  thumbnails: IThumbnail[];
  createdAt: string;
  updatedAt: string;
  categories: ICategory[];
  collection_pages: ICollectionPage[];
  totalUsed: string;
  accessible: boolean;
  eSignCompatible: boolean;
  primaryTaskCategory: string;
  primaryIndustryCategory: string;
  primaryFormTypeFilterCategory: ICategory;
  relatedForms: string[];
  relatedFormByDomain: string[];
  faqSummary: string;
  faqWhoNeedsToFill: string;
  faqWhereToSubmit: string;
  searchTerms: string[];
  tags: string[];
  owner: ITemplateOwner;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  formTypes: ICategory[];
  countryCode: string[];
  stateCode: string[];
  longFormContent: BlocksContent;
  trustIndicator: ITrustIndicator;
  _formatted?: ITemplate;
  _matchesPosition?: Record<string, any>;
  file: IFile;
  variation?: IVariation[];
  fileNavigation: FileNavigation;
  timeSensitiveGrouping: ITemplateTimeSensitiveGrouping[];
  availableForQuery: boolean;
  legalReview: boolean;
  writerName: string;
  bioLink: string;
  role: LegalReviewRole;
  timeSensitiveSlug?: string;
  usage: string;
  thumbnail: string;
  fileUrl: string;
}

type BaseSearchResult = Pick<ITemplate, "id" | "slug" | "categories">;

type SearchResultTemplate = {
  type: SearchResultType.Form;
} & BaseSearchResult;

type SearchResultCategory = {
  type: SearchResultType.Category;
} & BaseSearchResult;

type SearchResultRecentKeywords = {
  type: SearchResultType.RecentKeyword;
} & Partial<BaseSearchResult>;

export type SearchResult = {
  title: string;
  fieldShowInSearchResult: string;
} & (SearchResultTemplate | SearchResultCategory | SearchResultRecentKeywords);

export type SearchDataResult = SearchResult[];

export interface ICommonFilterQuery {
  ids?: string[];
  excludeTemplateIds?: string[];
  slug?: string | string[];
  name?: string;
  categorySlug?: string;
  collectionPageSlug?: string;
  domain?: FilterDomains | string;
  publishedDateTimestamp?: number;
  formTypes?: string | string[];
  countries?: string | string[];
  states?: string | string[];
  language?: string | string[];
  primaryFormTypeFilterCategorySlugs?: string[];
  categoryName?: string;
  excludeCountryCodes?: string[];
  excludeStateCodes?: string[];
  categoryFormTypes?: { category: string; formTypes: string[] };
  collectionSlugOrRelatedByDomain?: {
    collectionSlug: string;
    domains: string[];
  };
  templatedIdsOrRelatedByDomain?: { ids: string[]; domains: string[] };
}

export type EventSelectPreviewTemplate = {
  searchTerm?: string;
  formTypeValue?: string[];
  countryValue?: string[];
  stateValue?: string[];
  languageValue?: string[];
  sortValue?: string;
};
