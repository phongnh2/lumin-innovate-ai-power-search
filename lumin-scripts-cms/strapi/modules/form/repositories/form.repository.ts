/**
 * Form Repository
 *
 * Data Access Layer for Form operations.
 * All API calls to Strapi for forms should go through this repository.
 */

import * as qs from "querystringify";
import { omit } from "lodash";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { IStrapiApiResponse } from "@strapi/modules/strapi/interfaces/index.ts";
import { IStrapiForm, IStrapiResponse, IUpdatePayload } from "../interfaces/index.ts";
import { writeDataToCSV } from "@strapi/utils/file.ts";

export class FormRepository extends StrapiService {
  private currentTime = new Date().toISOString();

  /**
   * Create a new form in Strapi
   */
  public async createForm(formData: Record<string, unknown>): Promise<IStrapiResponse> {
    try {
      const response = await fetch(`${this.getStrapiEndpoint}/api/forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getStrapiApiToken,
        },
        body: JSON.stringify({
          data: omit(formData, "id"),
        }),
      });

      const result: IStrapiResponse = await response.json();

      if (!response.ok || result.error) {
        const errorMessage = result.error?.details?.errors
          ?.map((error) => `[${error.path.join(".")}]: ${error.message}`)
          .join(", ") ||
          result.error?.message ||
          `HTTP ${result.error.status}: ${response.statusText}`;
        return {
          ok: false,
          status: response.status,
          error: { status: response.status, message: errorMessage },
          data: null,
        };
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        status: 0,
        error: { status: 500, message: errorMessage },
        data: null,
      };
    }
  }

  /**
   * Update an existing form in Strapi
   */
  public async updateForm(
    id: number | null,
    body?: { data: IUpdatePayload },
  ): Promise<IStrapiResponse> {
    const updateEndpoint = `${this.getStrapiEndpoint}/api/forms/${id}`;
    if (!id || !body) {
      throw new Error("ID and body are required");
    }

    const errorResponse: IStrapiResponse = {
      ok: false,
      status: 0,
      error: { message: "" },
      data: null,
    };

    try {
      const response = await fetch(updateEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getStrapiApiToken,
        },
        body: JSON.stringify({
          data: {
            isScripting: true,
            ...body.data,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        const errorMessage = result.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        await writeDataToCSV(
          `"${id}", "${errorMessage.replace(/"/g, '""')}"`,
          `strapi/logs/error-update-template-${this.currentTime}.csv`,
        );

        console.log("❌ updateForm error:", id, errorMessage);
        return { ...errorResponse, error: { message: errorMessage }, status: response.status };
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await writeDataToCSV(
        `"${id}", "${errorMessage.replace(/"/g, '""')}"`,
        `strapi/logs/error-update-template-${this.currentTime}.csv`,
      );

      console.log("❌ updateForm network error:", id, errorMessage);
      return { ...errorResponse, error: { message: errorMessage } };
    }
  }

  /**
   * Get a single form by ID from Strapi API
   */
  public async getFormFromAPI(formId: number): Promise<IStrapiForm | null> {
    try {
      const response = await fetch(`${this.getStrapiEndpoint}/api/forms/${formId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getStrapiApiToken,
        },
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Error fetching form ${formId}:`, error);
      return null;
    }
  }

  /**
   * Paginated fetch of all forms with full populate
   * Accepts a callback to process each page of results
   */
  public async handleGetForms(
    callback: (result: IStrapiApiResponse<IStrapiForm>) => void,
  ): Promise<void> {
    let page = 1;
    let totalPage = 1;
    const itemsPerPage = 100;
    console.log(`🦊 Export ${itemsPerPage} items per page`);

    do {
      try {
        const baseUrl = `${this.getStrapiEndpoint}/api/forms`;
        const queryParams = qs.stringify({
          "populate[0]": "categories",
          "populate[1]": "categories.parent",
          "populate[2]": "relatedForms",
          "populate[3]": "relatedFormDomains",
          "populate[4]": "file",
          "populate[5]": "thumbnails",
          "pagination[page]": page,
          "pagination[pageSize]": 100,
          "publicationState": "preview",
          "sort[0]": "id",
        });

        const endpoint = `${baseUrl}?${queryParams}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.getStrapiApiToken,
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json() as IStrapiApiResponse<IStrapiForm>;
        totalPage = result?.meta?.pagination?.pageCount || 1;
        console.log(`> Exporting page ${page}/${totalPage}`);

        callback(result);

        page = result?.meta?.pagination?.page + 1;
      } catch (error) {
        console.error(`❌ Error fetching forms page ${page}:`, error);
        throw error;
      }
    } while (page <= totalPage);
  }

  /**
   * Paginated fetch of form slugs only (lightweight query)
   * Accepts a callback to process each page of results
   */
  public async handleGetSlugForms(
    callback: (result: IStrapiApiResponse<IStrapiForm>) => void,
  ): Promise<void> {
    let page = 1;
    let totalPage = 1;
    const itemsPerPage = 100;
    console.log(`🦊 Export ${itemsPerPage} items per page`);

    do {
      try {
        const baseUrl = `${this.getStrapiEndpoint}/api/forms`;
        const queryParams = qs.stringify({
          "fields[0]": "slug",
          "pagination[page]": page,
          "pagination[pageSize]": itemsPerPage,
          "publicationState": "preview",
          "sort[0]": "id",
        });

        const endpoint = `${baseUrl}?${queryParams}`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.getStrapiApiToken,
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json() as IStrapiApiResponse<IStrapiForm>;
        totalPage = result?.meta?.pagination?.pageCount || 1;
        console.log(`> Exporting page ${page}/${totalPage}`);

        callback(result);

        page = result?.meta?.pagination?.page + 1;
      } catch (error) {
        console.error(`❌ Error fetching forms page ${page}:`, error);
        throw error;
      }
    } while (page <= totalPage);
  }
}

export const formRepository = new FormRepository();
