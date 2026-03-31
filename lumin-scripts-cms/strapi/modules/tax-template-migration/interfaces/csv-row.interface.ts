export interface ICsvRow {
  template_release_id: string;
  time_sensitive_grouping: string;
  title: string;
  published_date: string;
  outdated: string;
  published: string;
}

export interface ICsvParseResult {
  rows: ICsvRow[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
}
