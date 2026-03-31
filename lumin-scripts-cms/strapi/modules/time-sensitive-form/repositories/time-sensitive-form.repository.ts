/**
 * TimeSensitiveForm Repository
 *
 * Data Access Layer for TimeSensitiveForm operations.
 * All API calls to Strapi for time-sensitive-forms should go through this repository.
 */

import * as qs from "querystringify";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { IStrapiApiResponse } from "@strapi/modules/strapi/interfaces/index.ts";
import { IStrapiTimeSensitiveForm } from "../interfaces/index.ts";

export class TimeSensitiveFormRepository extends StrapiService {
  /**
   * Paginated fetch of all time-sensitive-forms with forms populated
   * Accepts a callback to process each page of results
   */
  public async handleGetTimeSensitiveForms(
    callback: (result: IStrapiApiResponse<IStrapiTimeSensitiveForm>) => void,
  ): Promise<void> {
    let page = 1;
    let totalPage = 1;
    const itemsPerPage = 100;
    console.log(`🦊 Export ${itemsPerPage} items per page`);

    do {
      try {
        const baseUrl = `${this.getStrapiEndpoint}/api/time-sensitive-forms`;
        const queryParams = qs.stringify({
          "populate[0]": "forms",
          "populate[1]": "forms.id",
          "populate[2]": "forms.title",
          "populate[3]": "forms.outdated",
          "populate[4]": "forms.slug",
          "populate[5]": "forms.templateReleaseId",
          "populate[6]": "forms.publishedDate",
          "populate[7]": "forms.publishedAt",
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

        const result = await response.json() as IStrapiApiResponse<IStrapiTimeSensitiveForm>;
        totalPage = result?.meta?.pagination?.pageCount || 1;
        console.log(`> Exporting page ${page}/${totalPage}`);

        callback(result);

        page = result?.meta?.pagination?.page + 1;
      } catch (error) {
        console.error(`❌ Error fetching time-sensitive-forms page ${page}:`, error);
        throw error;
      }
    } while (page <= totalPage);
  }
}

export const timeSensitiveFormRepository = new TimeSensitiveFormRepository();
