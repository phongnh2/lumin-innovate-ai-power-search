import { OrganizationRoleEnums } from 'Organization/organization.enum';

export interface IOrganizationInviteLinkModel {
  inviteId: string;
  orgId: string;
  role: Exclude<OrganizationRoleEnums, OrganizationRoleEnums.ORGANIZATION_ADMIN>;
  createdAt: Date;
  actorId: string;
  expiresAt: Date;
}

export interface IOrganizationInviteLink extends IOrganizationInviteLinkModel {
  _id: string;
}

export interface OrganizationInviteLinkWithStatus extends IOrganizationInviteLink {
  isExpiringSoon?: boolean;
  isExpired?: boolean;
}

export interface OrganizationInviteLinkData {
  orgId: string;
  actorId: string;
  role?: string;
  expiresAt?: Date;
}
