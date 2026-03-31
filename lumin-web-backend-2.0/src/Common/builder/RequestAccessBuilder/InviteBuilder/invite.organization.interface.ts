import { AccessTypeOrganization } from 'Organization/organization.enum';

export type InviteOrganizationEntity = {
    role: string;
}

export class InviteOrganizationInterface {
  constructor(
    private email: string,
    private orgId: string,
    private entityData: InviteOrganizationEntity,
    private inviterId: string,
  ) {}

  public export(): Record<string, unknown> {
    return {
      actor: this.email,
      target: this.orgId,
      entity: this.entityData,
      inviterId: this.inviterId,
      type: AccessTypeOrganization.INVITE_ORGANIZATION,
    };
  }

  get actor(): string {
    return this.email;
  }

  get target(): string {
    return this.orgId;
  }

  get entity(): InviteOrganizationEntity {
    return this.entityData;
  }
}
