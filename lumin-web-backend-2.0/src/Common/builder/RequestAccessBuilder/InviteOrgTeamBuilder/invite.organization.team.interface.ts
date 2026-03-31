import { AccessTypeOrganization } from 'Organization/organization.enum';

export type InviteOrganizationTeamEntity = {
    role: string;
    invitee: string;
}

export class InviteOrganizationTeamInterface {
  constructor(
    private email: string,
    private teamId: string,
    private entityData: InviteOrganizationTeamEntity,
  ) {}

  public export(): Record<string, unknown> {
    return {
      actor: this.email,
      target: this.teamId,
      entity: this.entityData,
      type: AccessTypeOrganization.INVITE_ORGANIZATION_TEAM,
    };
  }

  get actor(): string {
    return this.email;
  }

  get target(): string {
    return this.teamId;
  }

  get entity(): InviteOrganizationTeamEntity {
    return this.entityData;
  }
}
