export interface IMigrationConfig {
  endpoint: string;
  token: string;
}

export type MappingBatch = "all" | "first10" | "remaining";

export interface IMigrationOptions {
  dryRun: boolean;
  silent: boolean;
  useCache?: boolean;
  mappingBatch?: MappingBatch;
}
