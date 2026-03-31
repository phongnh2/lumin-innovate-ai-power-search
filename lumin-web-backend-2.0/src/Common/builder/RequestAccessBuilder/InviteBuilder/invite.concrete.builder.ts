/* eslint-disable import/extensions */
import { RequestAccessBuilder } from 'Common/builder/RequestAccessBuilder/request.access.builder';

import { InviteOrganizationEntity, InviteOrganizationInterface } from './invite.organization.interface';

export class InviteOrganizationConcreteBuilder implements RequestAccessBuilder<InviteOrganizationInterface, InviteOrganizationEntity> {
  private email: string;

  private orgId: string;

  private entity: InviteOrganizationEntity;

  private inviterId: string;

  setActor(email: string): InviteOrganizationConcreteBuilder {
    this.email = email;
    return this;
  }

  setEntity(entity: InviteOrganizationEntity): InviteOrganizationConcreteBuilder {
    this.entity = entity;
    return this;
  }

  setTarget(orgId: string): InviteOrganizationConcreteBuilder {
    this.orgId = orgId;
    return this;
  }

  setInviterId(inviterId: string): InviteOrganizationConcreteBuilder {
    this.inviterId = inviterId;
    return this;
  }

  build(): Record<string, unknown> {
    return new InviteOrganizationInterface(this.email, this.orgId, this.entity, this.inviterId).export();
  }
}
