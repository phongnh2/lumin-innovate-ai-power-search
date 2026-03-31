import { Colors } from "@strapi/config/enum.ts";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { IForm } from "./interfaces/index.ts";
import { loadCurrentForms } from "./helpers/form-data.helper.ts";
import { formValidationService } from "./services/form-validation.service.ts";
import { formDownloadService } from "./services/form-download.service.ts";
import { formUploadService } from "./services/form-upload.service.ts";
import { formImportJsonService } from "./services/form-import-json.service.ts";
import { formUpdateService } from "./services/form-update.service.ts";
import { formExportService } from "./services/form-export.service.ts";
import { formUtilityService } from "./services/form-utility.service.ts";
import { formPublishService } from "./services/form-publish.service.ts";
import { FormCsvMigrationService } from "./services/form-csv-migration.service.ts";

export class FormController extends StrapiService {
  public currentForms: IForm[] = [];
  private csvMigrationService: FormCsvMigrationService;

  constructor() {
    super();
    this.csvMigrationService = new FormCsvMigrationService();
    this.loadCurrentData();
  }

  private async loadCurrentData() {
    try {
      this.currentForms = await loadCurrentForms();

      if (this.currentForms.length > 0) {
        console.log(
          `${Colors.Green}✅ Loaded ${this.currentForms.length} existing forms${Colors.Reset}`,
        );
      } else {
        console.log(`${Colors.Yellow}⚠️  No existing forms found${Colors.Reset}`);
      }
    } catch (_error) {
      console.log(`${Colors.Yellow}⚠️  Could not load existing forms${Colors.Reset}`);
    }
  }

  public previewTemplatesCSV = formValidationService.previewTemplatesCSV.bind(
    formValidationService,
  );
  public downloadPDFFromCSV = formDownloadService.downloadPDFFromCSV.bind(formDownloadService);
  public downloadLuminFileFromCSV = formDownloadService.downloadLuminFileFromCSV.bind(
    formDownloadService,
  );
  public uploadFormFromCSV = formUploadService.uploadFormFromCSV.bind(formUploadService);
  public importFormFromJSON = formImportJsonService.importFormFromJSON.bind(formImportJsonService);
  public updateFormDataFromCSV = formUpdateService.updateFormDataFromCSV.bind(formUpdateService);
  public updateFormDataFromJSON = formUpdateService.updateFormDataFromJSON.bind(formUpdateService);
  public updateCustomForm = formUpdateService.updateCustomForm.bind(formUpdateService);

  public exportFromDataAsJSON = formExportService.exportFromDataAsJSON.bind(formExportService);
  public exportSlugFormDataAsJSON = formExportService.exportSlugFormDataAsJSON.bind(
    formExportService,
  );
  public exportFromDataAsCSV = formExportService.exportFromDataAsCSV.bind(formExportService);

  public findDuplicateReleaseId = formUtilityService.findDuplicateReleaseId.bind(
    formUtilityService,
  );
  public verifyAfterImport = formUtilityService.verifyAfterImport.bind(formUtilityService);
  public checkThumbnailsSort = formUtilityService.checkThumbnailsSort.bind(formUtilityService);

  public publishFormsAndUpdateOutdated = formPublishService.publishFormsAndUpdateOutdated.bind(
    formPublishService,
  );

  public migrateCsvWithJsonMapping(inputFilePath: string, outputFilePath: string) {
    return this.csvMigrationService.migrateCsvWithJsonMapping(inputFilePath, outputFilePath);
  }

  public migrateCsvFilesWithJsonMapping(inputFiles: string[], outputFileName?: string) {
    return this.csvMigrationService.migrateCsvFilesWithJsonMapping(inputFiles, outputFileName);
  }
}

export const formController = new FormController();
