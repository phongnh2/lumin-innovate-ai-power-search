import { Colors } from "@strapi/config/enum.ts";
import { StrapiService } from "@strapi/modules/strapi/strapi.service.ts";
import { timeSensitiveFormExportService } from "./services/time-sensitive-form-export.service.ts";
import { timeSensitiveFormBatchService } from "./services/time-sensitive-form-batch.service.ts";
import { timeSensitiveFormOutdatedService } from "./services/time-sensitive-form-outdated.service.ts";
import { timeSensitiveFormOutdatedTestService } from "./services/time-sensitive-form-outdated-test.service.ts";
import { timeSensitiveFormPreviewService } from "./services/time-sensitive-form-preview.service.ts";

export class TimeSensitiveFormController extends StrapiService {
  constructor() {
    super();
    console.log(`${Colors.Green}✅ TimeSensitiveForm controller initialized${Colors.Reset}`);
  }

  public exportTimeSensitiveFormDataAsJSON = timeSensitiveFormExportService
    .exportTimeSensitiveFormDataAsJSON.bind(
      timeSensitiveFormExportService,
    );

  public exportTimeSensitiveFormDataAsCSV = timeSensitiveFormExportService
    .exportTimeSensitiveFormDataAsCSV.bind(
      timeSensitiveFormExportService,
    );

  public createTimeSensitiveFormsFromCSV = timeSensitiveFormBatchService
    .createTimeSensitiveFormsFromCSV.bind(
      timeSensitiveFormBatchService,
    );

  public updateOutdatedFieldsByRule = timeSensitiveFormOutdatedService
    .updateOutdatedFieldsByRule.bind(
      timeSensitiveFormOutdatedService,
    );

  public checkOutdatedLogic = timeSensitiveFormOutdatedTestService
    .checkOutdatedLogic.bind(
      timeSensitiveFormOutdatedTestService,
    );

  public checkNewTimeSensitiveFormsFromCSV = timeSensitiveFormPreviewService
    .checkNewTimeSensitiveFormsFromCSV.bind(
      timeSensitiveFormPreviewService,
    );
}

export const timeSensitiveFormController = new TimeSensitiveFormController();
