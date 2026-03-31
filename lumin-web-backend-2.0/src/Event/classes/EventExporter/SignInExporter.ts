import { Row } from '@fast-csv/format';

import { EventExporterBase } from 'Event/classes/EventExporter/EventExporterBase';
import { ExportPrefixEnums } from 'Event/enums/event.enum';
import { IEventBody } from 'Event/interfaces/event.interface';
import { User } from 'User/interfaces/user.interface';

export class SignInExporter extends EventExporterBase {
  constructor(user: User) {
    super(user);
    this.prefix = ExportPrefixEnums.SIGNED_IN;
    this.headers = ['No.', 'Date', 'Time'];
  }

  formatEventsToRows(events: IEventBody[], startedIndex: number) : Row[] {
    const rows = [];
    for (let i = 0; i < events.length; i++) {
      const dateObject = this.extractEventDateAndTime(events[i]);
      const singleRow = [
        i + startedIndex + 1,
        dateObject.date,
        dateObject.time,
      ];
      rows.push(singleRow);
    }
    return rows;
  }
}
