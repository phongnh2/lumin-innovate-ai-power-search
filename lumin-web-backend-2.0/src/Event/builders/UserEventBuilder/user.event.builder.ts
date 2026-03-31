import { UserEventBody, UserEventMetadata } from 'Event/builders/event.builder.interface';
import { UserEvent } from 'Event/builders/UserEventBuilder/user.event';
import { AdminEventNameType, EventScopeType, SourceActions } from 'Event/enums/event.enum';
import { IEventActorModification, IEventUser } from 'Event/interfaces/event.interface';

export class UserEventBuilder {
  private eventName: AdminEventNameType;

  private actor: IEventUser;

  private target: IEventUser;

  private actorEventScope: EventScopeType[];

  private sourceAction: SourceActions;

  private sourceEventId: string;

  private metadata: UserEventMetadata;

  setName(name: AdminEventNameType): this {
    this.eventName = name;
    return this;
  }

  setActor(actor: IEventUser): this {
    this.actor = actor;
    return this;
  }

  setTarget(target: IEventUser): this {
    this.target = target;
    return this;
  }

  setScope(scopes: EventScopeType[]): this {
    this.actorEventScope = scopes;
    return this;
  }

  setSourceAction(action: SourceActions): this {
    this.sourceAction = action;
    return this;
  }

  setSourceEventId(id: string): this {
    this.sourceEventId = id;
    return this;
  }

  setUserPlan(planModification: IEventActorModification): this {
    this.target.modification = planModification;
    return this;
  }

  setMetadata(data: UserEventMetadata): this {
    this.metadata = data;
    return this;
  }

  build(): UserEventBody {
    return new UserEvent({
      eventName: this.eventName,
      eventTime: new Date(),
      sourceAction: this.sourceAction,
      sourceEventId: this.sourceEventId,
      actor: this.actor,
      target: this.target,
      actorEventScope: this.actorEventScope,
      metadata: this.metadata,
    }).getEventBody();
  }
}
