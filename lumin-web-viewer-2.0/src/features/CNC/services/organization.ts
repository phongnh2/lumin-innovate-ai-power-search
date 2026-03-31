import { SuggestedPremiumOrganization } from 'interfaces/organization/organization.interface';
import { IUserResult } from 'interfaces/user/user.interface';

import { client } from '../../../apollo';
import { FetchPolicy } from '../constants/graphql';
import { GET_GOOGLE_USERS_NOT_IN_CIRCLE, GET_SUGGESTED_PREMIUM_ORG_LIST_OF_USER } from '../graphql/organization';
import { GoogleUsersNotInCircleParams } from '../types/cncService.type';

export async function getSuggestedPremiumOrgListOfUser(): Promise<SuggestedPremiumOrganization[]> {
  const res = await client.query<{ getSuggestedPremiumOrgListOfUser: SuggestedPremiumOrganization[] }>({
    query: GET_SUGGESTED_PREMIUM_ORG_LIST_OF_USER,
    fetchPolicy: FetchPolicy.NETWORK_ONLY,
  });
  return res.data.getSuggestedPremiumOrgListOfUser;
}

export async function getGoogleUsersNotInCircle({
  googleAuthorizationEmail,
  orgId,
  shareEmails,
}: GoogleUsersNotInCircleParams): Promise<IUserResult[]> {
  const res = await client.query<{ getGoogleUsersNotInCircle: IUserResult[] }>({
    query: GET_GOOGLE_USERS_NOT_IN_CIRCLE,
    variables: {
      input: {
        orgId,
        googleAuthorizationEmail,
        shareEmails,
      },
    },
    fetchPolicy: FetchPolicy.NETWORK_ONLY,
  });
  return res.data.getGoogleUsersNotInCircle;
}
