/* eslint-disable unused-imports/no-unused-vars */
import { Row } from '@fast-csv/format';
import * as es from 'event-stream';
import * as fs from 'fs';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { CsvUtils } from 'Common/utils/CsvUtils';
import { Utils } from 'Common/utils/Utils';

import { EnvironmentService } from 'Environment/environment.service';
import { IEventBody } from 'Event/interfaces/event.interface';
import { IEventExporter, IExportedDateTime } from 'Event/interfaces/exporter.interface';
import { User } from 'User/interfaces/user.interface';

type NLastLines = {
  totalLines: number
  lastNLines: string[]
}

const DELIMITER = ',';

export class EventExporterBase implements IEventExporter {
  prefix: string;

  headers: string[] = [];

  user: User;

  constructor(user: User) {
    this.prefix = null;
    this.headers = [];
    this.user = user;
  }

  getFileName() : string {
    return `${this.prefix.toLowerCase()}_${this.user._id}.csv`;
  }

  async getNLastLines(filePath : string, nCount: number = 0) : Promise<NLastLines> {
    let totalLines: number = 0;
    const lastNLines : string[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(es.split())
        .pipe(
          es.mapSync((line: string) => {
            if (line !== '') {
              totalLines++;
              if (lastNLines.length > nCount) {
                lastNLines.shift();
              }
              lastNLines.push(line);
            }
          })
            .on('error', (error) => {
              reject(error);
            })
            .on('end', () => {
              resolve({
                // not include header
                totalLines: totalLines - 1,
                lastNLines,
              });
            }),
        );
    });
  }

  getFilePath(): string {
    const env = new EnvironmentService();
    const fileName = this.getFileName();
    const filePath = `${env.getByKey(EnvConstants.EXPORTED_FILE_PATH)}/${fileName}`;
    return filePath;
  }

  extractLastIndex(data: NLastLines) : number {
    const lastLine = data.lastNLines[data.lastNLines.length - 1];
    return +lastLine.substr(0, lastLine.indexOf(DELIMITER));
  }

  async removeFileIfExist() : Promise<void> {
    const filePath = this.getFilePath();
    await Utils.removeFile(filePath);
  }

  async export(events: IEventBody[]) : Promise<string> {
    const filePath = this.getFilePath();
    const csv = new CsvUtils({
      headers: this.headers,
      path: filePath,
      delimiter: DELIMITER,
    });

    const isExist = await Utils.isFileExisted(filePath);
    let startedIndex : number = 0;
    if (!isExist) {
      await csv.create();
    } else {
      const data = await this.getNLastLines(filePath, 1);
      startedIndex = this.extractLastIndex(data);
    }
    const rows = this.formatEventsToRows(events, startedIndex);
    await csv.append(rows);
    return filePath;
  }

  formatEventsToRows(events: IEventBody[], startedIndex: number = 0) : Row[] {
    throw new Error('Method not implemented.');
  }

  extractEventDateAndTime(event: IEventBody) : IExportedDateTime {
    const dateObject = Utils.convertToLocalTime(new Date(event.eventTime), this.user.timezoneOffset);
    return {
      date: dateObject.format('L'),
      time: dateObject.format('LTS'),
    };
  }
}
