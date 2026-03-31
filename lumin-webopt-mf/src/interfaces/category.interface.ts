import {
  MobilePrimaryCategory,
  PrimaryCategory,
  TextPrimaryCategoryValues,
} from "@/enum/category.enum";

import type { FaqItem } from "./faq.interface";

export interface ICategory {
  id: number;
  name: string;
  parent: ICategory;
  slug: string;
  totalForms: number;
  totalCustomForms: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  _formatted: ICategory;
  _matchesPosition: Record<string, any>;
  _rankingScore: number;
  luminForCategory: string;
  luminForCategoryBodyCopy: string;
  whatIsForm: string;
  whatIsFormBody: string;
  heroSubCopy: string;
  title: string;
  faqs: FaqItem[];
  description: string;
  image: string;
  backgroundColor: string;
}

export interface ICategoryField {
  id: number | string;
  name: string;
  slug: string;
  formType?: string;
}
export interface IPrimaryCategory extends ICategoryField {
  parent: ICategoryField;
  tab: TextPrimaryCategoryValues;
}

export interface ICategogryFormType {
  id: number;
  name: string;
  slug: string;
}

export type ICategoryPanelResponse = {
  [props in PrimaryCategory | MobilePrimaryCategory]: Omit<
    ICategory,
    "parent"
  >[];
} & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ITransformCategory = {
  formTypeData: IPrimaryCategory[];
  combineData: IPrimaryCategory[];
  dataType: MobilePrimaryCategory;
  pageQueryParam: number;
};

export type ICategoryTabValues = {
  currentPage: number;
  hasNextPage: boolean;
  items: IPrimaryCategory[];
  totalPages: number;
};

export type IPrimaryCategoryTransformed = Record<
  TextPrimaryCategoryValues[number],
  ICategoryTabValues
>;

export type TTextPrimaryCategoryKeys = keyof typeof TextPrimaryCategoryValues;

export type TTextPrimaryCategoryValues =
  (typeof TextPrimaryCategoryValues)[TTextPrimaryCategoryKeys];

export type ICategoryPanel = Record<
  PrimaryCategory[number],
  Omit<ICategory, "parent">[]
>;

export type IPrimaryCategoryHeader = Record<
  MobilePrimaryCategory[number],
  ICategoryTabValues
>;
