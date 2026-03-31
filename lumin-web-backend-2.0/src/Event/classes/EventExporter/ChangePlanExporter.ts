import { Row } from '@fast-csv/format';

import { ElasticsearchUtil } from 'Common/elasticSearch/Utils';

import { EventExporterBase } from 'Event/classes/EventExporter/EventExporterBase';
import { ExportPrefixEnums } from 'Event/enums/event.enum';
import { IEventActorModification, IEventBody } from 'Event/interfaces/event.interface';
import { IExportedDateTime } from 'Event/interfaces/exporter.interface';
import { User } from 'User/interfaces/user.interface';

export class ChangePlanExporter extends EventExporterBase {
  constructor(user: User) {
    super(user);
    this.prefix = ExportPrefixEnums.CHANGED_PLAN;
    this.headers = ['No.', 'Plan type', 'Plan name', 'Date', 'Time'];
  }

  formatEventsToRows(events: IEventBody[], startedIndex: number = 0) : Row[] {
    const rows = [];
    for (let i = 0; i < events.length; i++) {
      const dateObject = this.extractEventDateAndTime(events[i]);
      const singleRow = [
        i + startedIndex + 1,
        this.getPlanType(events[i]),
        this.getPlanName(events[i]),
        dateObject.date,
        dateObject.time,
      ];
      rows.push(singleRow);
    }
    return rows;
  }

  getPlanType(event: IEventBody): string {
    if (event.organization?._id) {
      return 'Organization';
    }
    if (event.team?._id) {
      return 'Team';
    }
    return 'Individual';
  }

  getPlanModificationModification(event: IEventBody) : IEventActorModification {
    const planType = this.getPlanType(event);

    switch (planType) {
      case 'Organization':
        // return event.organization.modification;
        return null;
      case 'Team':
        return event.team.modification;
      case 'Individual':
        return event.actor.modification;
      default:
        return null;
    }
  }

  getPlanName(event: IEventBody): string {
    const modification = this.getPlanModificationModification(event);
    if (!modification) {
      return '';
    }
    return `${ElasticsearchUtil.getStandardText(modification.plan)}${modification.planCharge >= 0 ? ` - $${modification.planCharge}` : ''}`;
  }

  async export(events: IEventBody[]) : Promise<string> {
    return super.export(events);
  }

  extractEventDateAndTime(event: IEventBody) : IExportedDateTime {
    return super.extractEventDateAndTime(event);
  }
}
