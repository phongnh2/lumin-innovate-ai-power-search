import { Modify } from 'Common/factory/NotiFactory/noti.interface';

import { APP_USER_TYPE } from 'Auth/auth.enum';
import { IDocument } from 'Document/interfaces/document.interface';
import { User } from 'graphql.schema';
import { IOrganization } from 'Organization/interfaces/organization.interface';
import { ITeam } from 'Team/interfaces/team.interface';
import { ITemplate } from 'Template/interfaces/template.interface';

import { NotiFirebaseInterface } from '../noti.firebase.interface';

export type NotiFirebaseTeamInterface = Modify<
  NotiFirebaseInterface,
  {
    actor?: Partial<User>;
    targetUser?: Partial<User>;
    actorType?: Partial<APP_USER_TYPE>;
    team: Partial<ITeam>;
    organization: Partial<IOrganization>;
    document?: Partial<IDocument>;
    template?: Partial<ITemplate>;

    totalDocuments?: Partial<number>;
    totalFolders?: Partial<number>;
  }
>;
