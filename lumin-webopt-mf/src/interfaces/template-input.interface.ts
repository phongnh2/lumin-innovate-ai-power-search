import type { MeilisearchTemplateAttr } from "@/enum/template.enum";

import type {
  ITemplate,
  ITemplateTimeSensitiveGrouping,
} from "./template.interface";

export type ThumbnailInput = {
  [MeilisearchTemplateAttr.ThumbnailUrl]: string;
  [MeilisearchTemplateAttr.ThumbnailAlt]: string;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  name: string;
  provider: string;
};

export type FileInput = {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  provider: string;
  url: string;
  templateName: string;
};

export type BaseTemplateInput = {
  id: number;
  title: string;
  slug: string;
  domain: string;
  totalUsed: string;
  categories: ITransformCategoryData[];
  relatedFormByDomain?: string[];
  domainFavicon?: {
    url: string;
  };
  outdated: boolean;
};

export type VariationInput = {
  id: number;
  variationIdentifier: string;
  file: FileInput;
  thumbnails: ThumbnailInput[];
};

export type TimeSensitiveGroupingInput = ITemplateTimeSensitiveGrouping;

export type TemplateInput = BaseTemplateInput &
  Omit<
    ITemplate,
    | "thumbnails"
    | "variation"
    | "timeSensitiveGrouping"
    | "owner"
    | "id"
    | "title"
    | "slug"
    | "categories"
    | "totalUsed"
    | "relatedFormByDomain"
  > & {
    [MeilisearchTemplateAttr.Thumbnails]: ThumbnailInput[];
    variation?: VariationInput[];
    [MeilisearchTemplateAttr.TimeSensitiveGrouping]: TimeSensitiveGroupingInput[];
  };

export type FilterInput = {
  [MeilisearchTemplateAttr.FormTypesName]: Record<string, number>;
  [MeilisearchTemplateAttr.CountryCode]: Record<string, number>;
  [MeilisearchTemplateAttr.StateCode]: Record<string, number>;
};

export type FormatFilterParams = {
  formTypes?: string;
  countryCode?: string;
  stateCode?: string;
  language?: string;
};

export type FormatFilterPayload = {
  formTypes: string[] | null;
  countryCodeFormated: string[] | null;
  stateCode: string[] | null;
  language: string[] | null;
};

export interface ITransformCategoryData {
  name: string;
  slug: string;
  parent?: ITransformCategoryData;
  id: string;
}
