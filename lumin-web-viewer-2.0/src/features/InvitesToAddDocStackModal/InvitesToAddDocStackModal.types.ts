import { OrganizationMemberInvitation } from 'interfaces/organization/organization.interface';

export type User = {
  _id?: string;
  status?: string;
  email: string;
  name?: string;
  remoteName?: string;
  avatarRemoteId?: string;
};

export type UserPayload = Pick<User, 'email'> & {
  role: string;
};

export type TrackModalSubmitProps = {
  numberOfDocs: number;
  members: (UserPayload & { _id: string })[];
  invitations: OrganizationMemberInvitation[];
};
