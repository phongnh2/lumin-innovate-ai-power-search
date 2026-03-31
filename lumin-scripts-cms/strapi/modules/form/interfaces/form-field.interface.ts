import { ImportStatus } from "@strapi/config/enum.ts";
import { CONFIGURATION } from "@strapi/config/settings.ts";

export type FieldToUpdateType = typeof CONFIGURATION.FIELD_TO_UPDATE[number];

export type DynamicFieldType = {
  // deno-lint-ignore no-explicit-any
  [K in FieldToUpdateType]?: any;
};

export type FormToUpdateType = DynamicFieldType & {
  id: number | null;
  fileName: string | null;
  pdfUrl: string | null;
  luminUrl: string | null;
  alternativeText: string | null;
  importStatus: ImportStatus | null;
  publish: string | null;
  createdAt: string;
  updatedAt: string;
  published_at: string | null;
  publishedAt: string | null;
};

export type FieldConfigType = {
  key: keyof FormToUpdateType;
  // deno-lint-ignore no-explicit-any
  value?: any;
};
