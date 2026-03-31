import { PaymentPlans } from 'constants/plan.enum';

import { SuggestedOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationListData } from 'interfaces/redux/organization.redux.interface';
import { IUser, IUserResult, FindUserInput } from 'interfaces/user/user.interface';

declare namespace userServices {
  export function updateDefaultWorkspace(orgId: string): Promise<IUser>;

  export function reactiveAccount(): Promise<IUser>;

  export function confirmUpdateAnnotation(input: Record<string, unknown>): Promise<IUser>;

  export function getGoogleContacts(
    accessToken: string,
    input: { action: string; orgId?: string; googleAuthorizationEmail: string }
  ): Promise<IUserResult[]>;

  export function findUser(input: FindUserInput): Promise<IUserResult[]>;

  export function saveHubspotProperties(input: Record<string, unknown>): Promise<void>;

  export function updateSignaturePosition({
    signatureRemoteId,
    toPosition,
  }: {
    signatureRemoteId: string;
    toPosition: number;
  }): Promise<void>;

  export function getPlanType(
    user: IUser,
    userOrgs?: OrganizationListData[]
  ): {
    entity: string;
    payment: {
      type: PaymentPlans;
    };
  };

  export function updateUserMetadata(input: Record<string, unknown>): Promise<void>;

  export function getOnedriveToken(): Promise<{
    accessToken: string;
    email: string;
    expiredAt: string;
    oid: string;
  }>;

  export function getUsersSameDomain(): Promise<IUserResult[]>;

  export function seenNewNotificationsTab(tab: string): Promise<IUser>;

  export function dismissWorkspaceBanner(): Promise<{
    statusCode: number;
    message: string;
  }>;

  export function acceptNewTermsOfUse(acceptTermsForUserInput?: {
    orgId: string;
    teamId?: string;
  }): Promise<{ user: IUser }>;

  export function ratedApp({ ratedScore }: { ratedScore: number }): Promise<void>;

  export function getHighestPlan(
    user: IUser,
    userOrgs?: OrganizationListData[]
  ): {
    type: PaymentPlans;
    priceVersion: number;
  };

  export function getSuggestedOrgListOfUser(): Promise<SuggestedOrganization[]>;
}

export default userServices;
