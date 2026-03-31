import { pickBy } from 'lodash';

import { OrgEventBody } from 'Event/builders/event.builder.interface';

export class OrganizationEvent {
  constructor(private eventData: OrgEventBody) {}

  getEventBody(): OrgEventBody {
    return pickBy(this.eventData) as OrgEventBody;
  }
}
