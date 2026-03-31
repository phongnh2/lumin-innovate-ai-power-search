import * as path from "@std/path";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { writeDataToCSV } from "@strapi/utils/file.ts";
import { IFileInfo, IUploadOptions } from "../interfaces/index.ts";
import { getFileMimeType } from "../helpers/file.helper.ts";

export class UploadRepository extends StrapiService {
  private timestamp = new Date().toISOString();

  public async uploadFileToStrapi(
    filePath: string,
    options: IUploadOptions = {},
  ): Promise<unknown> {
    const { fileName = path.basename(filePath), alternativeText = "" } = options;

    try {
      await Deno.stat(filePath);
    } catch (_error) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = await Deno.readFile(filePath);

    const formData = new FormData();
    const file = new File([fileContent], fileName || "unknown", {
      type: getFileMimeType(filePath),
    });

    const fileInfo: IFileInfo = {
      name: fileName,
      alternativeText,
    };

    formData.append("files", file);
    formData.append("fileInfo", JSON.stringify(fileInfo));

    return this.uploadFileToStrapiUploadApi(filePath, formData);
  }

  public async updateFileMetadata(fileId: number, payload: unknown): Promise<unknown> {
    const updateEndpoint = `${this.getStrapiEndpoint}/api/upload?id=${fileId}`;

    try {
      const response = await fetch(updateEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getStrapiApiToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.error) {
        await writeDataToCSV(
          `"${fileId}", "${result.error.toString()}"`,
          `strapi/logs/error-update-media-${this.timestamp}.csv`,
        );
        console.log(
          "❌ Error updating media metadata: ",
          fileId,
          JSON.stringify(result),
        );
        return result.error;
      }

      return result;
    } catch (error) {
      console.error("❌ Error updating file metadata:", error);
      throw error;
    }
  }

  private async uploadFileToStrapiUploadApi(
    filePath: string,
    formData: FormData,
  ): Promise<unknown> {
    const uploadEndpoint = `${this.getStrapiEndpoint}/api/upload`;

    try {
      const response = await fetch(uploadEndpoint, {
        method: "POST",
        headers: this.getStrapiApiToken
          ? {
            Authorization: this.getStrapiApiToken,
          }
          : {},
        body: formData,
      });

      const result = await response.json();
      if (result.error) {
        console.log("❌ API Token:", this.getStrapiApiToken);
        console.log(JSON.stringify(result));
        throw new Error(result.error.message || "Upload failed");
      }

      return result;
    } catch (error) {
      console.error("❌ Error uploading file:", filePath, error);
      throw error;
    }
  }
}

export const uploadRepository = new UploadRepository();
