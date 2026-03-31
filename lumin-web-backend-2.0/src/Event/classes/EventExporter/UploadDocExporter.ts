import { Row } from '@fast-csv/format';

import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';

import { EventExporterBase } from 'Event/classes/EventExporter/EventExporterBase';
import { ExportPrefixEnums } from 'Event/enums/event.enum';
import { IEventBody } from 'Event/interfaces/event.interface';
import { IExportedDateTime } from 'Event/interfaces/exporter.interface';
import { User } from 'User/interfaces/user.interface';

export class UploadDocExporter extends EventExporterBase {
  constructor(user: User) {
    super(user);
    this.prefix = ExportPrefixEnums.UPLOADED_DOC;
    this.headers = ['No.', 'Type of document', 'Document name', 'Date', 'Time'];
  }

  formatEventsToRows(events: IEventBody[], startedIndex: number = 0) : Row[] {
    const rows = [];
    for (let i = 0; i < events.length; i++) {
      const dateObject = this.extractEventDateAndTime(events[i]);
      const singleRow = [
        i + startedIndex + 1,
        ElasticsearchUtil.getDocumentTypeText(events[i]),
        events[i].document?.name,
        dateObject.date,
        dateObject.time,
      ];
      rows.push(singleRow);
    }
    return rows;
  }

  async export(events: IEventBody[]) : Promise<string> {
    return super.export(events);
  }

  extractEventDateAndTime(event: IEventBody) : IExportedDateTime {
    return super.extractEventDateAndTime(event);
  }
}
