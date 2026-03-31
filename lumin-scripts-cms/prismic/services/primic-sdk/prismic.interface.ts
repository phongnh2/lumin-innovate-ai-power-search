export interface IPrismicDocument {
  id: string;
  uid: string | null;
  type: string;
  data: {
    body?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface IPrismicAuthResponse {
  token: string;
}

export interface IUrlReplacement {
  original: string;
  replaced: string;
}

export interface IFileProcessResult {
  filePath: string;
  modified: boolean;
  replacements: IUrlReplacement[];
}

export interface IExportResult {
  customType: string;
  documentsCount: number;
  outputPath: string;
}

export interface IUpdateResult {
  documentId: string;
  success: boolean;
  error?: string;
}

export interface IPrismicClientConfig {
  repo: string;
  accessToken: string;
}
