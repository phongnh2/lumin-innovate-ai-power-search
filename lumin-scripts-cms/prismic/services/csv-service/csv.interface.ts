export interface ICsvRow {
  [key: string]: string;
}

export interface ICsvService {
  readCsvFile(filePath: string): Promise<ICsvRow[]>;
  writeCsvFile(data: ICsvRow[], filePath: string): Promise<void>;
  extractUrlsFromCsv(csvData: ICsvRow[], urlColumn: string): string[];
}
