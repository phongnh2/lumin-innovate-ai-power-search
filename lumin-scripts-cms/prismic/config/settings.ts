import { isProductionEnv } from "../utils/helpers.ts";

export const PRISMIC_CONFIG = {
  DATA_DIR: isProductionEnv() ? "prismic/data" : "prismic/data",
  CSV_DIR: isProductionEnv() ? "prismic/data/csv" : "prismic/data/csv",
  OUTPUT_DIR: isProductionEnv() ? "prismic/data/output" : "prismic/data/output",
  LOGS_DIR: isProductionEnv() ? "prismic/logs" : "prismic/logs",
  XML_DIR: isProductionEnv() ? "prismic/data/xml" : "prismic/data/xml",
} as const;

export const SITEMAP_CONFIG = {
  SITEMAP_FILE: "sitemap.xml",
  CSV_FILE: "urls.csv",
  OUTPUT_FILE: "url-check-results.csv",
} as const;
