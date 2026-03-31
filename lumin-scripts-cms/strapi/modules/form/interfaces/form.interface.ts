import { ICategory, IStrapiCategory } from "@strapi/modules/category/interfaces/index.ts";
import {
  IFile,
  IStrapiFile,
  IStrapiThumbnail,
  IThumbnail,
} from "@strapi/modules/media/interfaces/index.ts";
import { DataWrapper } from "@strapi/modules/strapi/interfaces/index.ts";
import { ILegalWriterAttributes } from "@strapi/modules/form/interfaces/legal-writer.interface.ts";

export interface IFormAttributes extends ILegalWriterAttributes {
  title: string;
  eSignCompatible: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  description: string;
  domain: string;
  language: string;
  faqPublisher: string;
  faqWhoNeedsToFill: string;
  faqSummary: string;
  faqCountry: string;
  faqState: string;
  countryCode: string;
  stateCode: string;
  slug: string;
  accessible: boolean;
  subTitle: string;
  publishedDate: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  ranking: number;
  amountUsed: number;
  faqWhereToSubmit: string;
  initUsed: number;
  internalNotes: string;
  outdated: boolean;
  tempUsedCount: number;
  templateReleaseId: string;
  longFormContent: string | null;
}

export interface IForm extends IFormAttributes {
  id: number;
  categories: ICategory[];
  file: IFile | null;
  thumbnails: IThumbnail[];
  relatedForms: number[];

  alternativeText: string | null;
  publish: boolean;
  pdfUrl: string | null;
}

export interface IStrapiForm {
  id: number;
  attributes: IFormAttributes & {
    categories: DataWrapper<IStrapiCategory>;
    relatedForms: DataWrapper<IStrapiForm>;
    thumbnails: DataWrapper<IStrapiThumbnail>;
    file: { data: IStrapiFile };
  };
}
