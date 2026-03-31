export const PRISMIC_AUTH = {
  REPO: Deno.env.get("PRISMIC_REPO") || "lumindev",
  EMAIL: Deno.env.get("PRISMIC_EMAIL") || "test.luminpdf@gmail.com",
  PASSWORD: Deno.env.get("PRISMIC_PASSWORD") || "",
  TOKEN: Deno.env.get("PRISMIC_TOKEN") || "",
  API_KEY: "cSaZlfkQlF9C6CEAM2Del6MNX9WonlV86HPbeEJL",
} as const;

export const PRISMIC_PATHS = {
  EXPORT_DIR: "prismic/data/export/documents-by-custom-types",
  EXPORT_FOUND_DIR: "prismic/data/export/found",
  EXPORT_OUTPUT_SUCCESS_DIR: "prismic/data/export/output/success",
  EXPORT_OUTPUT_FAIL_DIR: "prismic/data/export/output/fail",
} as const;

export const PRISMIC_ENDPOINTS = {
  AUTH: "https://auth.prismic.io/login",
  MIGRATION: "https://migration.prismic.io/documents",
} as const;

export const URL_PATTERNS = {
  // Match URLs like:
  // https://account.luminpdf.com/sign-in
  // https://account.luminpdf.com/sign-in/
  // https://account.luminpdf.com/sign-in?return_to=abc
  // https://account.luminpdf.com/sign-in/?return_to=abc
  SIGN_IN: /https:\/\/account\.luminpdf\.com\/sign-in\/?(?:\?[^"\s]*)?/gi,
  GUEST_GENERATE: /https:\/\/www\.luminpdf\.com\/app\/generate\/guest\/?(?:\?[^"\s]*)?/gi,
} as const;

export const CUSTOM_TYPES = {
  // Add your custom types here
  // Example: PAGE: "page", BLOG_POST: "blog_post"
} as const;
