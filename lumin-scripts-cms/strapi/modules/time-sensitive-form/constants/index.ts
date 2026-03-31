import { isProductionEnv } from "@strapi/utils/helpers.ts";

export const TIME_SENSITIVE_FORM_JSON_PATH = {
  PRODUCTION: "strapi/data/json/production-time-sensitive-form.json",
  STAGING: "strapi/data/json/staging-time-sensitive-form.json",
} as const;

export const getTimeSensitiveFormJsonPath = (): string => {
  return isProductionEnv()
    ? TIME_SENSITIVE_FORM_JSON_PATH.PRODUCTION
    : TIME_SENSITIVE_FORM_JSON_PATH.STAGING;
};
