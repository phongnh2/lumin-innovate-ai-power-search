import { Session } from '@ory/client';

import { IUserRules } from 'CustomRules/interfaces/custome-rule.interface';

import { IOrganization } from 'Organization/interfaces/organization.interface';

export interface IGqlRequest {
  headers: any;
  user: any;
  signUpUser?: any;
  body: any;
  data: any;
  type: any;
  res: any;
  cookies: any;
  session?: Session | Partial<Session>
  anonymousUserId?: string;
  userRules?: IUserRules;
  organization?: IOrganization
}
