import { IOrganization } from './organization';

export interface ITeam {
  _id: string;
  name: string;
  avatarRemoteId: string;
  belongsTo?: IOrganization;
  createdAt: string;
  url: string;
}
