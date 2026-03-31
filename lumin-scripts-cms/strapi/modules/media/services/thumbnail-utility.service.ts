import * as path from "@std/path";
import { Colors } from "@strapi/config/enum.ts";
import { LT_CARD } from "@strapi/config/settings.ts";
import { IThumbnailCapabilities } from "../interfaces/index.ts";
import { checkThumbnailCapabilities as checkCapabilities } from "../helpers/capability-checker.helper.ts";

export class ThumbnailUtilityService {
  private outputDirectory = `./strapi/data/thumbnails/${LT_CARD}`;

  public async getThumbnailFiles(fileName: string): Promise<string[]> {
    try {
      const thumbnailFiles: string[] = [];

      for await (const dirEntry of Deno.readDir(this.outputDirectory)) {
        if (dirEntry.isFile && dirEntry.name.includes(fileName)) {
          thumbnailFiles.push(path.join(this.outputDirectory, dirEntry.name));
        }
      }

      return thumbnailFiles.slice(0, 10);
    } catch (error) {
      console.error(
        `${Colors.Red}❌ Error reading thumbnail directory: ${this.outputDirectory}${Colors.Reset}`,
        error,
      );
      return [];
    }
  }

  public async checkThumbnailCapabilities(): Promise<IThumbnailCapabilities> {
    return await checkCapabilities();
  }

  public async cleanupOldThumbnails(olderThanDays = 7): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let cleanedCount = 0;

      for await (const dirEntry of Deno.readDir(this.outputDirectory)) {
        if (dirEntry.isFile) {
          const filePath = path.join(this.outputDirectory, dirEntry.name);
          const stat = await Deno.stat(filePath);

          if (stat.mtime && stat.mtime < cutoffDate) {
            await Deno.remove(filePath);
            cleanedCount++;
          }
        }
      }

      console.log(
        `${Colors.Green}🧹 Cleaned up ${cleanedCount} old thumbnail files${Colors.Reset}`,
      );
    } catch (error) {
      console.error(`${Colors.Red}❌ Error during thumbnail cleanup:${Colors.Reset}`, error);
    }
  }
}

export const thumbnailUtilityService = new ThumbnailUtilityService();
