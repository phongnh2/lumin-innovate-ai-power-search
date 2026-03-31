import { load } from "jsr:@std/dotenv";

await load({ export: true });

export class StrapiService {
  private strapiEndpoint: string | null = null;
  private apiToken: string | null = null;

  constructor() {
    this.strapiEndpoint = Deno.env.get("STRAPI_ENDPOINT") || null;
    this.apiToken = Deno.env.get("STRAPI_API_TOKEN") || null;
  }

  public get getStrapiEndpoint(): string {
    return this.strapiEndpoint || "";
  }

  public get getStrapiApiToken(): string {
    return this.apiToken || "";
  }
}
