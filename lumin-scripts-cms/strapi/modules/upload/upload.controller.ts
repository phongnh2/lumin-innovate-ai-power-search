import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { uploadPdfService } from "./services/upload-pdf.service.ts";
import { uploadLuminService } from "./services/upload-lumin.service.ts";
import { uploadThumbnailService } from "./services/upload-thumbnail.service.ts";
import { uploadMetadataService } from "./services/upload-metadata.service.ts";

export class UploadController extends StrapiService {
  public uploadPDFs = uploadPdfService.uploadPDFs.bind(uploadPdfService);
  public uploadPDFsFromJSON = uploadPdfService.uploadPDFsFromJSON.bind(uploadPdfService);
  public retryFailedPDFUploads = uploadPdfService.retryFailedPDFUploads.bind(uploadPdfService);

  public uploadLuminFiles = uploadLuminService.uploadLuminFiles.bind(uploadLuminService);

  public uploadThumbnails = uploadThumbnailService.uploadThumbnails.bind(uploadThumbnailService);
  public uploadThumbnailsFromJSON = uploadThumbnailService.uploadThumbnailsFromJSON.bind(
    uploadThumbnailService,
  );
  public retryFailedThumbnailUploads = uploadThumbnailService.retryFailedThumbnailUploads.bind(
    uploadThumbnailService,
  );

  public updateMediaFileMetadata = uploadMetadataService.updateMediaFileMetadata.bind(
    uploadMetadataService,
  );
}

export const uploadController = new UploadController();
