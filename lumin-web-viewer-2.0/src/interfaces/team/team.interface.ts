export interface ITeamPath {
  _id: string;
  path?: {
    _id: string;
  };
}

export interface ITeam {
  _id: string;
  roleOfUser: string;
  name: string;
  avatarRemoteId: string;
  path?: ITeamPath;
  totalMembers?: number;
}
