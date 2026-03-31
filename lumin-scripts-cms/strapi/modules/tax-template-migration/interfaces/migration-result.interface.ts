export interface IMigrationResult {
  timeSensitiveGroupings: Map<string, import("./grouping.interface.ts").ITimeSensitiveGrouping>;
  totalValidForms: number;
  formsWithMissingDates: import("./csv-row.interface.ts").ICsvRow[];
  groupingsWithMultiplePrimary: string[];
  groupingsWithNoPrimary: string[];
  formsWithMismatchedGrouping: Array<import("./csv-row.interface.ts").ICsvRow & { reason: string }>;
}

export interface IMigrationStats {
  groupingsCreated: number;
  groupingsSkipped: number;
  formsUpdated: number;
  formsSkipped: number;
  errors: number;
  durationSeconds: number;
}

export interface ISyncStats {
  formsRenamed: number;
  formsMissing: number;
  errors: number;
  durationSeconds: number;
}

export interface IResetStats {
  formsUnlinked: number;
  formsSkipped: number;
  groupingsDeleted: number;
  groupingsSkipped: number;
  errors: number;
  durationSeconds: number;
}

export interface IValidationResult {
  missingForms: Array<{
    template_release_id: string;
    csv_title: string;
    grouping: string;
  }>;
  titleMismatches: Array<{
    template_release_id: string;
    csv_title: string;
    strapi_title: string;
    grouping: string;
  }>;
  totalChecked: number;
  durationSeconds: number;
}
