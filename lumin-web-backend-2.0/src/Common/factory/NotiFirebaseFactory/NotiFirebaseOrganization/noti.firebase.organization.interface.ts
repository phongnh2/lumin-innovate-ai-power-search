import { Modify } from 'Common/factory/NotiFactory/noti.interface';

import { APP_USER_TYPE } from 'Auth/auth.enum';
import { IDocument } from 'Document/interfaces/document.interface';
import { User } from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';

import { NotiFirebaseInterface } from '../noti.firebase.interface';

export type NotiFirebaseOrganizationInterface = Modify<
  NotiFirebaseInterface,
  {
    actor?: Partial<User>;
    actorType?: APP_USER_TYPE;
    targetUser?: Partial<User>;
    organization: Partial<IOrganization>;
    document?: Partial<IDocument>;
    removedDomain?: Partial<string>

    role?: Partial<string>;
    totalDocuments?: Partial<number>;
    totalFolders?: Partial<number>;
  }
>;
