import { Row } from '@fast-csv/format';

import { EventExporterBase } from 'Event/classes/EventExporter/EventExporterBase';
import { ExportPrefixEnums } from 'Event/enums/event.enum';
import { IEventBody } from 'Event/interfaces/event.interface';
import { User } from 'User/interfaces/user.interface';

export class InvitationExporter extends EventExporterBase {
  constructor(user: User) {
    super(user);
    this.prefix = ExportPrefixEnums.INVITATION;
    this.headers = ['No.', 'Invited email address', 'Target Team/Organization', 'Date', 'Time'];
  }

  formatEventsToRows(events: IEventBody[], startedIndex: number) : Row[] {
    const rows = [];
    for (let i = 0; i < events.length; i++) {
      const dateObject = this.extractEventDateAndTime(events[i]);
      const singleRow = [
        i + startedIndex + 1,
        events[i].target.email,
        this.formatTargetName(events[i]),
        dateObject.date,
        dateObject.time,
      ];
      rows.push(singleRow);
    }
    return rows;
  }

  formatTargetName(event: IEventBody) : string {
    if (event.organization?._id) {
      return `${event.organization.name} - Organization`;
    }
    if (event.team?._id) {
      return `${event.team.name} - Team`;
    }
    return '';
  }
}
