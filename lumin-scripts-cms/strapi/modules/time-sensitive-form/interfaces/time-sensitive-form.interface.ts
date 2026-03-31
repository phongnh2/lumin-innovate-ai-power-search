import { DataWrapper } from "@strapi/modules/strapi/interfaces/index.ts";

export interface ITimeSensitiveFormAttributes {
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ITimeSensitiveFormFormAttributes {
  id: number;
  title: string;
  outdated: boolean;
  slug: string;
  templateReleaseId: string;
  publishedDate: string | null;
  publishedAt: string | null;
}

export interface ITimeSensitiveForm extends ITimeSensitiveFormAttributes {
  id: number;
  forms: ITimeSensitiveFormFormAttributes[];
}

export interface IStrapiTimeSensitiveFormForm {
  id: number;
  attributes: {
    title: string;
    outdated: boolean;
    slug: string;
    templateReleaseId: string;
    publishedDate: string | null;
    publishedAt: string | null;
  };
}

export interface IStrapiTimeSensitiveForm {
  id: number;
  attributes: ITimeSensitiveFormAttributes & {
    forms: DataWrapper<IStrapiTimeSensitiveFormForm>;
  };
}

export interface ITimeSensitiveFormCsvRow {
  id: number;
  name: string;
  slug: string;
  formIds: string;
  templateReleaseIds: string;
}
