export const BATCH_DELAY_MS = 100;
export const CHUNK_SIZE = 5;
export const CHUNK_DELAY_MS = 1000;
export const MAPPING_FIRST_BATCH_SIZE = 10;
export const MAX_RETRIES = 3;
export const API_PAGE_SIZE = 100;

export const CSV_FILE_PATH =
  "strapi/data/csv/[PRODUCTION] strapi-form-2025-10 - WO structure to migrate version.csv";
export const OUTPUT_DIR = "strapi/data";
export const ID_MAPPINGS_FILE = "strapi/data/id-mappings.json";
export const MIGRATION_REPORT_FILE = "strapi/data/migration-report.txt";
export const SYNC_REPORT_FILE = "strapi/data/sync-report.txt";

export const FORMS_GROUPING_CACHE_PATH = {
  STAGING: "strapi/data/json/staging-forms-grouping-cache.json",
  PRODUCTION: "strapi/data/json/production-forms-grouping-cache.json",
};

export const TIME_SENSITIVE_FORMS_ENDPOINT = "/time-sensitive-forms";
export const FORMS_ENDPOINT = "/forms";
export const CATEGORIES_ENDPOINT = "/categories";

export const DEFAULT_STRAPI_ENDPOINT = "http://localhost:1337/";

export function getStrapiEndpoint(): string {
  const endpoint = Deno.env.get("STRAPI_ENDPOINT") || DEFAULT_STRAPI_ENDPOINT;
  return endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
}

export function getStrapiApiToken(): string | undefined {
  return Deno.env.get("STRAPI_API_TOKEN");
}
