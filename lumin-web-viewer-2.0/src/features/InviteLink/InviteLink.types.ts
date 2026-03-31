export interface InviteLink {
  _id: string;
  isExpired?: boolean;
  role: string;
  orgId: string;
  isExpiringSoon?: boolean;
  expiresAt: Date;
  inviteId: string;
}
