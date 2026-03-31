import { pickBy } from 'lodash';

import { UserEventBody } from 'Event/builders/event.builder.interface';

export class UserEvent {
  constructor(private eventData: UserEventBody) {}

  getEventBody(): UserEventBody {
    return pickBy(this.eventData) as UserEventBody;
  }
}
