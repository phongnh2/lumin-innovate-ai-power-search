/**
 * Form Data Helper
 *
 * Pure functions for form data transformation and validation.
 * No side effects, no API calls, no state mutations.
 */

import { slugify } from "@sudeepgumaste/slugify";
import { CONFIGURATION } from "@strapi/config/settings.ts";
import { Colors, ImportStatus, JIRA_CARD_TYPE } from "@strapi/config/enum.ts";
import {
  FORM_JSON_PATH,
  FORM_SLUG_JSON_PATH,
  INVALID_DATE,
  MAX_LENGTH_TITLE,
} from "@strapi/modules/form/constants/index.ts";
import { FormToUpdateType, ICsvRawData, IForm } from "../interfaces/index.ts";
import { readJsonFile } from "@strapi/utils/file.ts";
import { isProductionEnv } from "@strapi/utils/helpers.ts";
import { categoryController } from "@strapi/modules/category/category.controller.ts";
import { calculateInitialUsage } from "./calculation.helper.ts";
import { formatPublishDate } from "./date.helper.ts";
import { formatTitleForFileName, removeRevisionDateFromTitle } from "./string.helper.ts";
import { TIME_SENSITIVE_FORM_JSON_PATH } from "@strapi/modules/time-sensitive-form/constants/index.ts";
import { ITimeSensitiveForm } from "@strapi/modules/time-sensitive-form/interfaces/index.ts";
import { timeSensitiveFormValidationService as _timeSensitiveFormValidationService } from "@strapi/modules/time-sensitive-form/services/time-sensitive-form-validation.service.ts";

/**
 * Transform CSV raw data into FormToUpdateType
 * Handles validation, category mapping, and field transformations
 */
export async function getFormData({
  data,
  currentFormSlugs = new Set(),
}: {
  data: ICsvRawData;
  currentFormSlugs?: Set<string>;
}): Promise<{
  errors: string[];
  result: FormToUpdateType;
}> {
  const formJsonPath = isProductionEnv() ? FORM_JSON_PATH.PRODUCTION : FORM_JSON_PATH.STAGING;
  const currentForms = await readJsonFile(formJsonPath, []) as IForm[];

  const isCardReimport = CONFIGURATION.JIRA_CART_IMPORT_TYPE === JIRA_CARD_TYPE.RE_IMPORT;
  const csvFormId = Number(data[CONFIGURATION.PRIMARY_TEMPLATE_ID_FIELD]);
  const errorsStack: string[] = [];

  const publishedDate = formatPublishDate(data.publish_date);
  if (publishedDate === INVALID_DATE) {
    errorsStack.push(`Invalid publish date ${data.publish_date}`);
  }

  const { result: categoriesData, errors: errorsCategory } = categoryController
    .getCategoriesFromFormData(data);
  if (errorsCategory.length) {
    errorsStack.push(...errorsCategory);
  }

  const reimportId = currentForms.find(
    (f: IForm) => Number(f.templateReleaseId) === Number(csvFormId),
  )?.id ?? null;

  if (isCardReimport && !reimportId) {
    errorsStack.push(`Template ${csvFormId} not found`);
  }

  const title = data.template_name && modifyTitle(data.template_name);
  let slug = title ? slugify(title).toLowerCase() : "";

  const slugExists = Array.isArray(currentFormSlugs)
    ? currentFormSlugs.includes(slug)
    : currentFormSlugs.has(slug);

  if (
    CONFIGURATION.FIELD_TO_UPDATE.includes("slug") &&
    slugExists
  ) {
    slug = `${slug}-${csvFormId}`;
  }

  const categoriesIds = Array.from(
    new Set(categoriesData.map((category) => category.id)),
  );

  const language = data.language &&
    (data.language?.trim() === "unknown" ? "" : data.language?.trim());

  const outdated = data["outdated (Y/N)"];
  const esignCompatible = data["esign_compatible (Y/N)"];
  const accessible = data["accessible (Y/N)"];

  const initUsed = data.template_rank ? calculateInitialUsage(Number(data.template_rank)) : 0;

  const isFormOutdated = outdated?.toUpperCase() === "Y";

  const timeSensitiveGroupingId = await getTimeSensitiveGroupingIdFromJSON(
    data.time_sensitive_grouping,
  );

  if (data.time_sensitive_grouping?.trim() && !timeSensitiveGroupingId) {
    console.log(
      `${Colors.Red}❌ ~ TimeSensitive: "${data.time_sensitive_grouping}" → NOT FOUND in JSON${Colors.Reset}`,
    );
  }

  const formData: FormToUpdateType = {
    id: isCardReimport ? reimportId : null,
    title: title || "",
    slug,
    ranking: data.template_rank ? Number(data.template_rank) : null,
    eSignCompatible: esignCompatible === "Y",
    initUsed,
    accessible: accessible === "Y",
    publishedDate,
    subTitle: data.template_sub_title || data.subtitle || "",
    metaKeywords: data.meta_keywords || "",
    metaTitle: data.meta_title || "",
    metaDescription: data.meta_description || "",
    description: data.description || "",
    domain: data.domain || "",
    language: language || "",
    faqWhereToSubmit: data.faq_where_to_submit || "",
    faqPublisher: data.faq_publisher || "",
    faqWhoNeedsToFill: data.faq_who_needs_to_fill || "",
    faqSummary: data.faq_summary || "",
    faqCountry: data.faq_country || "",
    faqState: data.faq_state || "",
    countryCode: data.country_code || "",
    stateCode: data.state_code || "",
    categories: categoriesIds,
    ...(data.location && { location: data.location }),
    timeSensitiveGrouping: timeSensitiveGroupingId,
    outdated: isFormOutdated,
    templateReleaseId: csvFormId.toString(),
    fileName: String(data[CONFIGURATION.PRIMARY_FILE_NAME_FIELD] ?? formatTitleForFileName(title)),
    pdfUrl: String(data[CONFIGURATION.PRIMARY_PDF_URL_FIELD] || ""),
    luminUrl: String(data[CONFIGURATION.PRIMARY_LUMIN_FILE_FIELD] || ""),
    alternativeText: String(data[CONFIGURATION.PRIMARY_ALTERNATIVE_TEXT_FIELD] || ""),
    importStatus: (data[CONFIGURATION.PRIMARY_IMPORT_STATUS_FIELD] as ImportStatus) || null,
    publish: String(data[CONFIGURATION.PRIMARY_PUBLISH_FIELD] || ""),
    createdAt: "",
    updatedAt: "",
    published_at: null,
    publishedAt: null,
  };

  return {
    errors: errorsStack,
    result: formData,
  };
}

export function isValidateTemplate(formData: FormToUpdateType): {
  errors: string[];
  isValid: boolean;
} {
  const { categories = [], importStatus } = formData;

  const errors: string[] = [];
  const conditions: boolean[] = [];

  const isImportCard = CONFIGURATION.JIRA_CART_IMPORT_TYPE === JIRA_CARD_TYPE.IMPORT;

  const isValidStatus = !CONFIGURATION.STATUS_TO_IMPORT.length ||
    !importStatus ||
    CONFIGURATION.STATUS_TO_IMPORT.includes(importStatus);

  conditions.push(isValidStatus);

  if (isImportCard) {
    const hasCategories = categories && categories.length > 0;
    conditions.push(hasCategories);

    if (!hasCategories) {
      errors.push("Empty categories");
    }
  }

  const titleLength = formData.title?.length ?? 0;

  if (formData.title && titleLength > MAX_LENGTH_TITLE) {
    errors.push(`Invalid title length: ${titleLength}`);
  }

  return {
    errors,
    isValid: conditions.every(Boolean),
  };
}

export function modifyTitle(title: string): string {
  const removedRevisionDateTitle = removeRevisionDateFromTitle(title);
  return removedRevisionDateTitle;
}

export async function loadCurrentForms(): Promise<IForm[]> {
  try {
    const formJsonPath = isProductionEnv() ? FORM_JSON_PATH.PRODUCTION : FORM_JSON_PATH.STAGING;
    return await readJsonFile(formJsonPath, []);
  } catch (_error) {
    return [];
  }
}

async function getTimeSensitiveGroupingIdFromJSON(
  groupingName: string | undefined,
): Promise<number | null> {
  if (!groupingName?.trim()) {
    return null;
  }

  try {
    const trimmedGroupingName = groupingName.trim();
    const jsonPath = isProductionEnv()
      ? TIME_SENSITIVE_FORM_JSON_PATH.PRODUCTION
      : TIME_SENSITIVE_FORM_JSON_PATH.STAGING;

    const jsonContent = await Deno.readTextFile(jsonPath);
    const timeSensitiveForms: ITimeSensitiveForm[] = JSON.parse(jsonContent);

    const foundForm = timeSensitiveForms.find((form) => form.name.trim() === trimmedGroupingName);

    return foundForm ? foundForm.id : null;
  } catch (error) {
    console.error(`${Colors.Red}❌ Error reading time-sensitive forms JSON:${Colors.Reset}`, error);
    return null;
  }
}

export async function loadCurrentFormSlugs(): Promise<string[]> {
  try {
    const formSlugPath = isProductionEnv()
      ? FORM_SLUG_JSON_PATH.PRODUCTION
      : FORM_SLUG_JSON_PATH.STAGING;
    return await readJsonFile(formSlugPath, []);
  } catch (_error) {
    return [];
  }
}
