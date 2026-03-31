import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';

export interface IMembershipModel {
  userId: string;
  teamId: any;
  role: string;
}

export interface IMembership extends IMembershipModel {
  _id: string;
}

export interface IAddTeamMemberModel {
  members: any,
  resource: { team: Partial<ITeam>, actor: Partial<User>, organization?: Partial<IOrganization> }
  teamType: string,
  memberReceiveNoti?: boolean,
}

export interface IAddTeamMember extends IAddTeamMemberModel {
  _id: string;
}
