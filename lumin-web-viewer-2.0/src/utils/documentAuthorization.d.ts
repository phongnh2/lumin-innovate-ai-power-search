import { IDocumentBase } from 'interfaces/document/document.interface';
import { OrganizationListData } from 'interfaces/redux/organization.redux.interface';
import { ITeam } from 'interfaces/team/team.interface';
import { IUser } from 'interfaces/user/user.interface';

type GetDocAuthorizationParams = {
  document: IDocumentBase;
  teams: ITeam[];
  orgData: OrganizationListData[];
  currentUser: IUser;
};

export function getDocAuthorizationHOF({
  document,
  teams,
  orgData,
  currentUser,
}: GetDocAuthorizationParams): (action: string) => boolean;
