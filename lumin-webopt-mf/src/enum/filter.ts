import type { Dispatch, SetStateAction } from "react";

import type { ICategory } from "@/interfaces/category.interface";

import { FilterDomains } from "./meilisearch.enum";
import type { SortKeys } from "./sort";

export enum FormFilterKeys {
  Domain = "domain",
  CategoryFormTypes = "categoryFormTypes",
  CategorySlug = "categorySlug",
  CategoryName = "categoryName",
}

export enum FilterKeys {
  FormTypes = "formTypes",
  Countries = "countries",
  States = "states",
  // LT-485: Remove "Language" filter
  // Language = 'language',
}

export enum FilterParams {
  FormTypesName = "form-types",
  Country = "country",
  State = "state",
  // LT-485: Remove "Language" filter
  // Language = 'language',
}

export type FilterBase = {
  value: string;
  label: string;
};

export type FilterStates = Record<string, FilterBase[]>;

export type IFilter = {
  [FilterKeys.FormTypes]: FilterBase[];
  [FilterKeys.Countries]: FilterBase[];
  [FilterKeys.States]: FilterStates;
  [FormFilterKeys.Domain]?: FilterDomains;
  [FormFilterKeys.CategoryFormTypes]?: {
    category: string;
    formTypes: string[];
  };
};

export interface IFilterData {
  [FilterKeys.FormTypes]: FilterBase[];
  [FilterKeys.Countries]: FilterBase[];
  [FilterKeys.States]: FilterBase[];
  // LT-485: Remove "Language" filter
  // languages: string[];
}

export interface IFilterFormData {
  [FormFilterKeys.Domain]?: FilterDomains;
  [FormFilterKeys.CategorySlug]?: string;
  [FormFilterKeys.CategoryName]?: string;
}

export interface IFilterResult {
  categoryInfo?: ICategory;
  selectedSort: SortKeys;
  setSelectedSort: Dispatch<SetStateAction<SortKeys>>;
  selectedFilter: IFilterData;
  setSelectedFilter: (filter: IFilterData) => void;
  resetFilterState: () => void;
  getFilterQuery: () => string;
}

export interface IMobileFilterResult {
  selectedSort: SortKeys;
  setSelectedSort: Dispatch<SetStateAction<SortKeys>>;
  selectedFilter: IFilterFormData;
  setSelectedFilter: (filter: IFilterFormData) => void;
  resetFilterState: () => void;
}

export enum MobileFilterTypes {
  CATEGORY = "category",
  SORT = "sort",
}
export const SWIPE_THRESHOLD = 100;
