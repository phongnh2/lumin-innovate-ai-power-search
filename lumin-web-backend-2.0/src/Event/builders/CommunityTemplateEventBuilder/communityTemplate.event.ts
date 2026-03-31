import { pickBy } from 'lodash';

import { CommunityTemplateBody } from 'Event/builders/event.builder.interface';

export class CommunityTemplateEvent {
  constructor(private eventData: CommunityTemplateBody) {}

  getEventBody(): CommunityTemplateBody {
    return pickBy(this.eventData) as CommunityTemplateBody;
  }
}
