import { IFolder } from 'Folder/interfaces/folder.interface';
import { User } from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';

import { Modify } from '../../NotiFactory/noti.interface';
import { NotiFirebaseInterface } from '../noti.firebase.interface';

export type NotiFirebaseFolderInterface = Modify<
  NotiFirebaseInterface,
  {
    actor?: Partial<User>;
    organization?: Partial<IOrganization>;
    team?: Partial<ITeam>;
    folder: Partial<IFolder>;
  }
>;
