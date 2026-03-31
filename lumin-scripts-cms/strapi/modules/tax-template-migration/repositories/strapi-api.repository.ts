import type { IMigrationConfig } from "../interfaces/migration-config.interface.ts";
import type {
  IStrapiTimeSensitiveForm,
  IStrapiForm,
  ITimeSensitiveGrouping,
} from "../interfaces/grouping.interface.ts";
import {
  MAX_RETRIES,
  API_PAGE_SIZE,
  TIME_SENSITIVE_FORMS_ENDPOINT,
  FORMS_ENDPOINT,
  CATEGORIES_ENDPOINT,
} from "../constants/index.ts";
import { delay } from "../helpers/batch-processor.helper.ts";

const RETRYABLE_STATUSES = [429, 502, 503, 504];

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      if (RETRYABLE_STATUSES.includes(response.status)) {
        const waitTime = (i + 1) * 3000;
        console.log(
          `⚠️ ${response.status} (${response.status === 429 ? "rate limit" : "server unavailable"}), waiting ${waitTime / 1000}s...`
        );
        await delay(waitTime);
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`⚠️ Retry ${i + 1}/${retries} (network error)`);
      await delay(2000 * (i + 1));
    }
  }

  throw new Error(`Failed after ${retries} retries`);
}

function buildHeaders(config: IMigrationConfig, contentType = false): HeadersInit {
  const headers: HeadersInit = {
    Authorization: config.token,
  };

  if (contentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

function buildApiUrl(config: IMigrationConfig, path: string): string {
  return `${config.endpoint}api${path}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function fetchAllTimeSensitiveForms(
  config: IMigrationConfig
): Promise<IStrapiTimeSensitiveForm[]> {
  console.log("🔄 Fetching existing Time-sensitive Forms (including drafts)...");

  const allForms: IStrapiTimeSensitiveForm[] = [];
  let page = 1;

  while (true) {
    // Include publicationState=preview to get drafts as well
    const url = buildApiUrl(config, `${TIME_SENSITIVE_FORMS_ENDPOINT}?pagination[page]=${page}&pagination[pageSize]=${API_PAGE_SIZE}&publicationState=preview`);

    const response = await fetchWithRetry(url, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch Time-sensitive Forms: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    allForms.push(...result.data);

    if (result.data.length < API_PAGE_SIZE) {
      break;
    }
    page++;
  }

  console.log(`   ✓ Found ${allForms.length} existing Time-sensitive Forms`);
  return allForms;
}

export function normalizeGroupingName(name: string | undefined | null): string {
  return (name || "").trim().toLowerCase();
}

export function getGroupingName(grouping: IStrapiTimeSensitiveForm): string {
  return grouping.attributes?.name || grouping.name || "";
}

export async function createTimeSensitiveForm(
  config: IMigrationConfig,
  grouping: ITimeSensitiveGrouping
): Promise<{ id: number } | null> {
  const url = buildApiUrl(config, TIME_SENSITIVE_FORMS_ENDPOINT);
  const slug = generateSlug(grouping.name);

  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: buildHeaders(config, true),
    body: JSON.stringify({
      data: {
        name: grouping.name,
        slug: slug,
        publishedAt: null,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`❌ Failed to create Time-sensitive Form: ${grouping.name}`, errorBody);
    return null;
  }

  const result = await response.json();
  return { id: result.data.id };
}

export async function deleteTimeSensitiveForm(
  config: IMigrationConfig,
  id: number
): Promise<boolean> {
  const url = buildApiUrl(config, `${TIME_SENSITIVE_FORMS_ENDPOINT}/${id}`);

  const response = await fetchWithRetry(url, {
    method: "DELETE",
    headers: buildHeaders(config),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`❌ Failed to delete Time-sensitive Form ${id}:`, errorBody);
    return false;
  }

  return true;
}

export async function fetchFormById(
  config: IMigrationConfig,
  formId: string | number
): Promise<IStrapiForm | null> {
  const url = buildApiUrl(config, `${FORMS_ENDPOINT}/${formId}?fields[0]=id&fields[1]=title`);

  try {
    const response = await fetchWithRetry(url, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

export async function fetchFormWithGrouping(
  config: IMigrationConfig,
  formId: string | number
): Promise<{ id: number; groupingId: number | null } | null> {
  const url = buildApiUrl(config, `${FORMS_ENDPOINT}/${formId}?fields[0]=id&populate[timeSensitiveGrouping][fields][0]=id&publicationState=preview`);

  try {
    const response = await fetchWithRetry(url, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const form = result.data;
    
    if (!form) return null;

    const groupingData = form.attributes?.timeSensitiveGrouping?.data;
    const groupingId = groupingData?.id || null;

    return { id: form.id, groupingId };
  } catch {
    return null;
  }
}

export async function fetchAllFormsWithGroupings(
  config: IMigrationConfig
): Promise<Map<string, { strapiId: number; groupingId: number | null; groupingName: string | null; title: string }>> {
  console.log("🔄 Fetching all Forms with grouping relations...");

  const formGroupingMap = new Map<string, { strapiId: number; groupingId: number | null; groupingName: string | null; title: string }>();
  let page = 1;

  while (true) {
    const url = buildApiUrl(config, `${FORMS_ENDPOINT}?pagination[page]=${page}&pagination[pageSize]=${API_PAGE_SIZE}&fields[0]=id&fields[1]=templateReleaseId&fields[2]=title&populate[timeSensitiveGrouping][fields][0]=id&populate[timeSensitiveGrouping][fields][1]=name&publicationState=preview`);

    const response = await fetchWithRetry(url, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch Forms: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    
    for (const form of result.data) {
      const templateReleaseId = form.attributes?.templateReleaseId;
      if (!templateReleaseId) continue;
      
      const groupingData = form.attributes?.timeSensitiveGrouping?.data;
      const groupingId = groupingData?.id || null;
      const groupingName = groupingData?.attributes?.name || null;
      const title = form.attributes?.title || "";
      formGroupingMap.set(templateReleaseId, { strapiId: form.id, groupingId, groupingName, title });
    }

    if (result.data.length < API_PAGE_SIZE) {
      break;
    }
    page++;
  }

  const linkedCount = Array.from(formGroupingMap.values()).filter((v) => v.groupingId !== null).length;
  console.log(`   ✓ Found ${formGroupingMap.size} Forms with templateReleaseId (${linkedCount} with groupings)`);
  return formGroupingMap;
}

export async function fetchFormByTemplateReleaseId(
  config: IMigrationConfig,
  templateReleaseId: string
): Promise<{ id: number; title: string } | null> {
  const url = buildApiUrl(config, `${FORMS_ENDPOINT}?filters[templateReleaseId][$eq]=${encodeURIComponent(templateReleaseId)}&fields[0]=id&fields[1]=title&publicationState=preview`);

  try {
    const response = await fetchWithRetry(url, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result.data && result.data.length > 0) {
      const form = result.data[0];
      return { id: form.id, title: form.attributes?.title || "" };
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchFormsWithGrouping(config: IMigrationConfig): Promise<IStrapiForm[]> {
  console.log("🔄 Fetching Forms with timeSensitiveGrouping relation...");

  const allForms: IStrapiForm[] = [];
  let page = 1;

  while (true) {
    const url = buildApiUrl(config, `${FORMS_ENDPOINT}?pagination[page]=${page}&pagination[pageSize]=${API_PAGE_SIZE}&populate=timeSensitiveGrouping&filters[timeSensitiveGrouping][id][$notNull]=true&publicationState=preview`);

    const response = await fetchWithRetry(url, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch Forms: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    allForms.push(...result.data);

    if (result.data.length < API_PAGE_SIZE) {
      break;
    }
    page++;
  }

  console.log(`   ✓ Found ${allForms.length} Forms with timeSensitiveGrouping`);
  return allForms;
}

export async function updateFormGrouping(
  config: IMigrationConfig,
  formId: string | number,
  timeSensitiveFormId: number | null,
  publishedDate: string | null,
  outdated: boolean
): Promise<boolean> {
  const url = buildApiUrl(config, `${FORMS_ENDPOINT}/${formId}`);

  const response = await fetchWithRetry(url, {
    method: "PUT",
    headers: buildHeaders(config, true),
    body: JSON.stringify({
      data: {
        timeSensitiveGrouping: timeSensitiveFormId,
        publishedDate: publishedDate || null,
        outdated,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`❌ Failed to update Form ${formId}:`, errorBody);
    return false;
  }

  return true;
}

export async function unlinkFormFromGrouping(
  config: IMigrationConfig,
  formId: number
): Promise<boolean> {
  const url = buildApiUrl(config, `${FORMS_ENDPOINT}/${formId}`);

  const response = await fetchWithRetry(url, {
    method: "PUT",
    headers: buildHeaders(config, true),
    body: JSON.stringify({
      data: {
        timeSensitiveGrouping: null,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`❌ Failed to unlink Form ${formId}:`, errorBody);
    return false;
  }

  return true;
}

export async function updateFormTitle(
  config: IMigrationConfig,
  formId: string | number,
  newTitle: string
): Promise<boolean> {
  const url = buildApiUrl(config, `${FORMS_ENDPOINT}/${formId}`);

  const response = await fetchWithRetry(url, {
    method: "PUT",
    headers: buildHeaders(config, true),
    body: JSON.stringify({
      data: {
        title: newTitle,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`❌ Failed to update Form title ${formId}:`, errorBody);
    return false;
  }

  return true;
}

export async function fetchDefaultCategory(config: IMigrationConfig): Promise<number | null> {
  const url = buildApiUrl(config, `${CATEGORIES_ENDPOINT}?pagination[pageSize]=1`);

  try {
    const response = await fetchWithRetry(url, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    if (result.data && result.data.length > 0) {
      return result.data[0].id;
    }
    return null;
  } catch {
    return null;
  }
}

export async function createMockForm(
  config: IMigrationConfig,
  title: string,
  categoryId: number
): Promise<{ id: number } | null> {
  const url = buildApiUrl(config, FORMS_ENDPOINT);

  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: buildHeaders(config, true),
    body: JSON.stringify({
      data: {
        title,
        slug: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        categories: [categoryId],
        isMockForm: true,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`❌ Failed to create mock Form: ${title}`, errorBody);
    return null;
  }

  const result = await response.json();
  return { id: result.data.id };
}

export interface IFormPublishState {
  templateReleaseId: string;
  strapiId: number;
  title: string;
  isPublished: boolean;
}

export async function fetchAllFormsWithPublishState(
  config: IMigrationConfig
): Promise<Map<string, IFormPublishState>> {
  console.log("🔄 Fetching all Forms with publish state...");

  const formMap = new Map<string, IFormPublishState>();
  let page = 1;

  while (true) {
    const url = buildApiUrl(
      config,
      `${FORMS_ENDPOINT}?pagination[page]=${page}&pagination[pageSize]=${API_PAGE_SIZE}&fields[0]=id&fields[1]=templateReleaseId&fields[2]=title&fields[3]=publishedAt&publicationState=preview`
    );

    const response = await fetchWithRetry(url, {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch Forms: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();

    for (const form of result.data) {
      const templateReleaseId = form.attributes?.templateReleaseId;
      if (!templateReleaseId) continue;

      formMap.set(templateReleaseId, {
        templateReleaseId,
        strapiId: form.id,
        title: form.attributes?.title || "",
        isPublished: form.attributes?.publishedAt !== null,
      });
    }

    if (result.data.length < API_PAGE_SIZE) {
      break;
    }
    page++;
  }

  const publishedCount = Array.from(formMap.values()).filter((f) => f.isPublished).length;
  console.log(`   ✓ Found ${formMap.size} forms (${publishedCount} published, ${formMap.size - publishedCount} draft)`);
  return formMap;
}

export interface IPublishResult {
  success: boolean;
  error?: string;
  validationError?: boolean;
}

export async function publishForm(
  config: IMigrationConfig,
  formId: number
): Promise<IPublishResult> {
  const url = buildApiUrl(config, `${FORMS_ENDPOINT}/${formId}`);

  const response = await fetchWithRetry(url, {
    method: "PUT",
    headers: buildHeaders(config, true),
    body: JSON.stringify({
      data: {
        publishedAt: new Date().toISOString(),
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    
    // Check for validation errors (missing category, etc.)
    const isValidationError = errorBody.includes("category must be provided") ||
                              errorBody.includes("ApplicationError") ||
                              errorBody.includes("ValidationError");
    
    if (isValidationError) {
      // Extract error message
      try {
        const parsed = JSON.parse(errorBody);
        const msg = parsed?.error?.message || "Validation error";
        return { success: false, error: msg, validationError: true };
      } catch {
        return { success: false, error: "Validation error", validationError: true };
      }
    }
    
    console.error(`❌ Failed to publish Form ${formId}:`, errorBody);
    return { success: false, error: errorBody };
  }

  return { success: true };
}

export async function unpublishForm(
  config: IMigrationConfig,
  formId: number
): Promise<boolean> {
  const url = buildApiUrl(config, `${FORMS_ENDPOINT}/${formId}`);

  const response = await fetchWithRetry(url, {
    method: "PUT",
    headers: buildHeaders(config, true),
    body: JSON.stringify({
      data: {
        publishedAt: null,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`❌ Failed to unpublish Form ${formId}:`, errorBody);
    return false;
  }

  return true;
}
