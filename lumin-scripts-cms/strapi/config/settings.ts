import { ImportStatus, JIRA_CARD_TYPE, PDF_LIBRARRY, PDF_SOURCE } from "./enum.ts";

export const LT_CARD = "LT-TAX-updated";

export const CONFIGURATION = {
  JIRA_CART_IMPORT_TYPE: JIRA_CARD_TYPE.IMPORT,
  TEMPLATE_IMPORT_CSV_PATH: `strapi/data/csv/${LT_CARD}.csv`,
  TEMPLATE_IMPORT_CSV_READ_PATH: `./data/csv/${LT_CARD}.csv`,
  PDF_PATH: `strapi/data/pdf/${LT_CARD}/`,
  LUMIN_PATH: `strapi/data/lumin/${LT_CARD}/`,
  MAPPING_TEMPLATE_ID_JSON_PATH: `strapi/data/mapping-template/${LT_CARD}.json`,
  FAILED_UPLOADS_THUMBNAIL_PATH: "strapi/data/upload-failture/failed-uploads-thumbnail.json",
  FAILED_UPLOADS_PDF_PATH: "strapi/data/upload-failture/failed-uploads-pdf.json",
  FAILED_UPLOADS_LUMIN_PATH: "strapi/data/upload-failture/failed-uploads-lumin.json",
  PATH_THUMBNAIL: `strapi/data/${LT_CARD}`,

  // Condition to import
  STATUS_TO_IMPORT: [
    // ImportStatus.NEED_IMPORTING,
  ] as ImportStatus[],
  PRIMARY_LIBRARY_EXTRACT_PDF_TO_IMAGE: PDF_LIBRARRY.NODE_PDFTOCAIRO,

  // PRIMARY FIELD
  PRIMARY_FILE_NAME_FIELD: "file_name",
  PRIMARY_TEMPLATE_ID_FIELD: "strapi_id",
  PRIMARY_IMPORT_STATUS_FIELD: "Import status",
  PRIMARY_PDF_URL_FIELD: "Link to template in Drive ",
  PRIMARY_LUMIN_FILE_FIELD: "Link to .lumin file",
  PRIMARY_PUBLISH_FIELD: "Publish?",
  PRIMARY_ALTERNATIVE_TEXT_FIELD: "alt_text",
  PDF_SOURCE: PDF_SOURCE.MANUAL_DOWNLOAD,
  PUBLISH_WHEN_IMPORTING: false,

  FIELD_TO_UPDATE: [
    "title",
    "slug",
    "ranking",
    "eSignCompatible",
    "initUsed",
    "accessible",
    "publishedDate",
    "subTitle",
    "metaKeywords",
    "metaTitle",
    "metaDescription",
    "description",
    "domain",
    "language",
    "faqWhereToSubmit",
    "faqPublisher",
    "faqWhoNeedsToFill",
    "faqSummary",
    "faqCountry",
    "faqState",
    "countryCode",
    "stateCode",
    "categories",
    "location",
    "outdated",
    "templateReleaseId",
    "timeSensitiveGrouping",
    "file",
    "fileNavigation",
  ] as const,

  // How to get google token
  // - https://medium.com/@skylarng89/download-large-files-from-google-drive-using-drive-api-fcbdba64fb18
  // - https://developers.google.com/oauthplayground/?code=4/0AeanS0bMiLmX3ldmdhaUxgzonGfgt0AZkRNcyQzYyasSRYmvBNTcXEDVDiowhoLLIsngsA&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/drive.file%20https://www.googleapis.com/auth/drive.readonly%20https://www.googleapis.com/auth/spreadsheets%20https://www.googleapis.com/auth/spreadsheets.readonly%20https://www.googleapis.com/auth/tables
  GOOGLE_ACCESS_TOKEN: "",
};

export const DASH_LENGTH = 50;
