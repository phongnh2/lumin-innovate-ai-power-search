import * as fs from 'fs';
import {
  FormatterOptionsArgs, Row, writeToBuffer, writeToStream,
} from '@fast-csv/format';

type CsvFileOpts = {
    headers: string[];
    path: string;
    delimiter: string;
};

export class CsvUtils {
  private readonly headers: string[];

  private readonly path: string;

  private readonly writeOpts: FormatterOptionsArgs<Row, Row>;

  constructor(opts: CsvFileOpts) {
    this.headers = opts.headers;
    this.path = opts.path;
    this.writeOpts = {
      headers: this.headers,
      includeEndRowDelimiter: true,
      alwaysWriteHeaders: true,
      delimiter: opts.delimiter,
    };
  }

  static write(stream: NodeJS.WritableStream, rows: Row[], options: FormatterOptionsArgs<Row, Row>): Promise<void> {
    return new Promise((res, rej) => {
      writeToStream(stream, rows, options)
        .on('error', (err: Error) => rej(err))
        .on('finish', () => res());
    });
  }

  create(rows: Row[] = []): Promise<void> {
    return CsvUtils.write(fs.createWriteStream(this.path), rows, this.writeOpts);
  }

  append(rows: Row[]): Promise<void> {
    return CsvUtils.write(fs.createWriteStream(this.path, { flags: 'a' }), rows, {
      ...this.writeOpts,
      // dont write the headers when appending
      writeHeaders: false,
      alwaysWriteHeaders: false,
    } as FormatterOptionsArgs<Row, Row>);
  }

  read(): Promise<Buffer> {
    return new Promise((res, rej) => {
      fs.readFile(this.path, (err, contents) => {
        if (err) {
          return rej(err);
        }
        return res(contents);
      });
    });
  }

  static writeToBuffer(rows: Row[], options: Record<string, any>) : Promise<Buffer> {
    return writeToBuffer(rows, options);
  }
}
