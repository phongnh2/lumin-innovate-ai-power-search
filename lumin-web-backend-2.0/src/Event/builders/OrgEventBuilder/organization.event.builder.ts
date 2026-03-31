import { OrgEventBody } from 'Event/builders/event.builder.interface';
import { OrganizationEvent } from 'Event/builders/OrgEventBuilder/organization.event';
import { AdminEventNameType, EventScopeType, SourceActions } from 'Event/enums/event.enum';
import { IEventOrganization, IEventOrgPlanModification, IEventUser } from 'Event/interfaces/event.interface';
import { AdminEventMetadata } from 'graphql.schema';

export class OrganizationEventBuilder {
  private eventName: AdminEventNameType;

  private sourceAction: SourceActions;

  private sourceEventId: string;

  private actor: IEventUser;

  private organization: Partial<IEventOrganization>;

  private actorEventScope: EventScopeType[];

  private metadata: AdminEventMetadata;

  setName(name: AdminEventNameType): OrganizationEventBuilder {
    this.eventName = name;
    return this;
  }

  setActor(actor: IEventUser): OrganizationEventBuilder {
    this.actor = actor;
    return this;
  }

  setOrganization(organization: {
    _id?: string,
    name?: string,
    domain: string,
  }): OrganizationEventBuilder {
    this.organization = organization;
    return this;
  }

  setOrgPlan(planModification: IEventOrgPlanModification): OrganizationEventBuilder {
    this.organization.planModification = planModification;
    return this;
  }

  setScope(scopes: EventScopeType[]): OrganizationEventBuilder {
    this.actorEventScope = scopes;
    return this;
  }

  setSourceAction(action: SourceActions): OrganizationEventBuilder {
    this.sourceAction = action;
    return this;
  }

  setSourceEventId(id: string): OrganizationEventBuilder {
    this.sourceEventId = id;
    return this;
  }

  setMetadata(data: AdminEventMetadata): OrganizationEventBuilder {
    this.metadata = data;
    return this;
  }

  build(): OrgEventBody {
    return new OrganizationEvent({
      eventName: this.eventName,
      eventTime: new Date(),
      sourceAction: this.sourceAction,
      sourceEventId: this.sourceEventId,
      actor: this.actor,
      organization: this.organization,
      actorEventScope: this.actorEventScope,
      metadata: this.metadata,
    }).getEventBody();
  }
}
