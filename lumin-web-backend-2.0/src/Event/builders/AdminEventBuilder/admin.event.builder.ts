import { AdminEvent } from 'Event/builders/AdminEventBuilder/admin.event';
import { AdminEventBody } from 'Event/builders/event.builder.interface';
import { AdminEventNameType, EventScopeType } from 'Event/enums/event.enum';
import { IEventUser } from 'Event/interfaces/event.interface';

export class AdminEventBuilder {
  private eventName: AdminEventNameType;

  private actor: IEventUser;

  private target: IEventUser;

  private actorEventScope: EventScopeType[];

  setName(name: AdminEventNameType): AdminEventBuilder {
    this.eventName = name;
    return this;
  }

  setActor(actor: IEventUser): AdminEventBuilder {
    this.actor = actor;
    return this;
  }

  setTarget(target: IEventUser): AdminEventBuilder {
    this.target = target;
    return this;
  }

  setScope(scopes: EventScopeType[]): AdminEventBuilder {
    this.actorEventScope = scopes;
    return this;
  }

  build(): AdminEventBody {
    return new AdminEvent({
      eventName: this.eventName,
      eventTime: new Date(),
      actor: this.actor,
      target: this.target,
      actorEventScope: this.actorEventScope,
    }).getEventBody();
  }
}
