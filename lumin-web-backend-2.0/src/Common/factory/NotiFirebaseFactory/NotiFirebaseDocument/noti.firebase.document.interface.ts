import { IDocument } from 'Document/interfaces/document.interface';
import { Document } from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { User } from 'User/interfaces/user.interface';

import { Modify } from '../../NotiFactory/noti.interface';
import { NotiFirebaseInterface } from '../noti.firebase.interface';

export type NotiFirebaseDocumentInterface = Modify<
  NotiFirebaseInterface,
  {
    actor?: Partial<User>;
    document: Partial<IDocument | Document>;
    organization?: Partial<IOrganization>;
    team?: Partial<ITeam>;

    role?: Partial<string>;
    isMultipleDocs?: Partial<boolean>;
    totalDocuments?: Partial<number>;
  }
>;
