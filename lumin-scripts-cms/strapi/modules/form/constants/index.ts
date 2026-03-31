export const INVALID_DATE = "Invalid date";

export const FORM_JSON_PATH = {
  STAGING: "strapi/data/json/staging-form.json",
  PRODUCTION: "strapi/data/json/production-form.json",
};

export const FORM_SLUG_JSON_PATH = {
  STAGING: "strapi/data/json/staging-form-slugs.json",
  PRODUCTION: "strapi/data/json/production-form-slugs.json",
};

export type FormField =
  | "title"
  | "slug"
  | "ranking"
  | "eSignCompatible"
  | "initUsed"
  | "accessible"
  | "publishedDate"
  | "subTitle"
  | "metaKeywords"
  | "metaTitle"
  | "metaDescription"
  | "description"
  | "domain"
  | "language"
  | "faqWhereToSubmit"
  | "faqPublisher"
  | "faqWhoNeedsToFill"
  | "faqSummary"
  | "faqCountry"
  | "faqState"
  | "countryCode"
  | "stateCode"
  | "categories"
  | "location"
  | "outdated"
  | "templateReleaseId"
  | "timeSensitiveGrouping";

export const MAX_LENGTH_TITLE = 255;
