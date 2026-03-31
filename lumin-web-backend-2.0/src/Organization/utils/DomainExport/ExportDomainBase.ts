import { Row } from '@fast-csv/format';

import { CsvUtils } from 'Common/utils/CsvUtils';

export class ExportDomainBase {
  private headers: string[];

  private rows: Row[];

  private shouldIndex: boolean = false;

  export(): Promise<Buffer> {
    // write header
    this.transformHeader();
    this.transformRows();
    const options = {
      headers: this.headers,
      alwaysWriteHeaders: true,
    };
    return CsvUtils.writeToBuffer(this.rows, options);
  }

  setHeaders(headers: string[]): ExportDomainBase {
    this.headers = headers;
    return this;
  }

  setRows(rows: Row[]): ExportDomainBase {
    this.rows = rows;
    return this;
  }

  addIndex(): ExportDomainBase {
    this.shouldIndex = true;
    return this;
  }

  private transformHeader(): string[] {
    if (this.shouldIndex) {
      this.headers = ['No.', ...this.headers];
    }
    return this.headers;
  }

  private transformRows(): Row[] {
    if (this.shouldIndex) {
      const newRows = this.rows.map((row, idx) => [idx + 1, ...(row as Array<string>)]);
      this.rows = newRows;
    }
    return this.rows;
  }
}
