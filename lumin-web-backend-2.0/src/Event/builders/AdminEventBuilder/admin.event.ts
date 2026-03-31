import { pickBy } from 'lodash';

import { AdminEventBody } from 'Event/builders/event.builder.interface';

export class AdminEvent {
  constructor(private eventData: AdminEventBody) {}

  getEventBody(): AdminEventBody {
    return pickBy(this.eventData) as AdminEventBody;
  }
}
