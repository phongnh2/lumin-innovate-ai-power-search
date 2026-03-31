import * as qs from "querystringify";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { IStrapiApiResponse } from "@strapi/modules/strapi/interfaces/index.ts";
import { ICategory, IStrapiCategory } from "../interfaces/index.ts";

export class CategoryRepository extends StrapiService {
  public async fetchAllCategories(
    callback: (result: IStrapiApiResponse<IStrapiCategory>) => void,
  ): Promise<void> {
    let page = 1;
    let totalPages = 1;

    do {
      try {
        const query = qs.stringify({
          "populate[0]": "parent",
          "pagination[page]": page,
          "pagination[pageSize]": 100,
          "sort[0]": "id",
        });
        const endpoint = `${this.getStrapiEndpoint}/api/categories?${query}`;

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

        const result = await response.json() as IStrapiApiResponse<IStrapiCategory>;
        totalPages = result?.meta?.pagination?.pageCount || 1;
        console.log(`📄 Exporting categories page ${page}/${totalPages}`);

        callback(result);

        page = (result?.meta?.pagination?.page ?? 0) + 1;
      } catch (error) {
        console.error(`❌ Error fetching categories page ${page}:`, error);
        throw error;
      }
    } while (page <= totalPages);
  }

  public async createCategory(category: Partial<ICategory>): Promise<void> {
    try {
      const response = await fetch(`${this.getStrapiEndpoint}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getStrapiApiToken,
        },
        body: JSON.stringify({
          data: {
            ...category,
            forms: [],
            faqs: [],
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to create category ${category.name}:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`Failed to create category: ${category.name} - ${response.status}`);
      }

      await response.json();
      console.log(`✅ Created category: ${category.name}`);
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error);
      throw error;
    }
  }
}

export const categoryRepository = new CategoryRepository();
