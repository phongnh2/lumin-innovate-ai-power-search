import { CommunityTemplateEvent } from 'Event/builders/CommunityTemplateEventBuilder/communityTemplate.event';
import { CommunityTemplateBody } from 'Event/builders/event.builder.interface';
import { AdminEventNameType, EventScopeType } from 'Event/enums/event.enum';
import { IEventUser, IEventCommunityTemplate } from 'Event/interfaces/event.interface';

export class CommunityTemplateEventBuilder {
  private eventName: AdminEventNameType;

  private actor: IEventUser;

  private actorEventScope: EventScopeType[];

  private communityTemplate: IEventCommunityTemplate;

  setName(name: AdminEventNameType): CommunityTemplateEventBuilder {
    this.eventName = name;
    return this;
  }

  setActor(actor: IEventUser): CommunityTemplateEventBuilder {
    this.actor = actor;
    return this;
  }

  setTargetTemplate(communityTemplate: IEventCommunityTemplate): CommunityTemplateEventBuilder {
    this.communityTemplate = communityTemplate;
    return this;
  }

  setScope(scopes: EventScopeType[]): CommunityTemplateEventBuilder {
    this.actorEventScope = scopes;
    return this;
  }

  build(): CommunityTemplateBody {
    return new CommunityTemplateEvent({
      eventName: this.eventName,
      eventTime: new Date(),
      actor: this.actor,
      communityTemplate: this.communityTemplate,
      actorEventScope: this.actorEventScope,
    }).getEventBody();
  }
}
