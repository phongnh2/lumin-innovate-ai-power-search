import { StrapiService } from "../strapi/strapi.service.ts";
import { thumbnailGenerationService } from "./services/thumbnail-generation.service.ts";
import { thumbnailUtilityService } from "./services/thumbnail-utility.service.ts";

export class MediaController extends StrapiService {
  public generateThumbnailsFromFile = thumbnailGenerationService.generateThumbnailsFromFile.bind(
    thumbnailGenerationService,
  );
  public generateThumbnailsFromPdfFolder = thumbnailGenerationService
    .generateThumbnailsFromPdfFolder.bind(
      thumbnailGenerationService,
    );

  public getThumbnailFiles = thumbnailUtilityService.getThumbnailFiles.bind(
    thumbnailUtilityService,
  );
  public checkThumbnailCapabilities = thumbnailUtilityService.checkThumbnailCapabilities.bind(
    thumbnailUtilityService,
  );
  public cleanupOldThumbnails = thumbnailUtilityService.cleanupOldThumbnails.bind(
    thumbnailUtilityService,
  );
}

export const mediaController = new MediaController();
