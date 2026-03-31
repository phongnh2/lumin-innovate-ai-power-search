/* eslint-disable import/extensions */
import { RequestAccessBuilder } from 'Common/builder/RequestAccessBuilder/request.access.builder';

import { InviteOrganizationTeamEntity, InviteOrganizationTeamInterface } from './invite.organization.team.interface';

export class InviteOrganizationTeamConcreteBuilder implements RequestAccessBuilder<InviteOrganizationTeamInterface, InviteOrganizationTeamEntity> {
  private email: string;

  private teamId: string;

  private entity: InviteOrganizationTeamEntity;

  setActor(email: string): InviteOrganizationTeamConcreteBuilder {
    this.email = email;
    return this;
  }

  setEntity(entity: InviteOrganizationTeamEntity): InviteOrganizationTeamConcreteBuilder {
    this.entity = entity;
    return this;
  }

  setTarget(teamId: string): InviteOrganizationTeamConcreteBuilder {
    this.teamId = teamId;
    return this;
  }

  build(): Record<string, unknown> {
    return new InviteOrganizationTeamInterface(this.email, this.teamId, this.entity).export();
  }
}
