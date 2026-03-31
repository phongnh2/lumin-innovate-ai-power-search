export interface IOrganizationInviteLink {
  _id: string;
  orgId: string;
  role: string;
  actorId: string;
  expiresAt: Date;
  createdAt: Date;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
  inviteId: string;
}
