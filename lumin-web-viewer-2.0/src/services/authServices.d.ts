import { ApolloQueryResult } from '@apollo/client';
import { NavigateFunction } from 'react-router';

import { PaymentPeriod, PaymentPlans } from 'constants/plan.enum';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser, VerifyInvitationTokenPayload } from 'interfaces/user/user.interface';

declare class AuthService {
  onPostAuthentication(user: IUser): Promise<void>;

  onPostAuthenticationForViewer(user: IUser): Promise<void>;

  getMe({
    invitationToken,
    skipOnboardingFlow,
    isEnabledNewLayout,
  }: {
    invitationToken: string;
    skipOnboardingFlow?: boolean;
    isEnabledNewLayout?: boolean;
  }): Promise<ApolloQueryResult<{ getMe: { user: IUser } }>>;

  getNewAuthenRedirectUrl(user: IUser): { url: string };

  signInSuccess({ user }: { user: IUser }): Promise<void>;

  handleRedirectForPricing({
    period,
    promotion,
    plan,
    isTrial,
    navigate,
  }: {
    period: PaymentPeriod;
    promotion: string;
    plan: PaymentPlans;
    isTrial: boolean;
    navigate: NavigateFunction;
  }): void;

  triggerSessionExpired(): void;

  verifyNewUserInvitationToken(token: string): Promise<VerifyInvitationTokenPayload>;

  afterSignOut(returnTo?: boolean | { url: string }, kratosNavigate?: () => void): Promise<void>;

  validateIPWhitelist(email: string): Promise<void>;

  setupSocketForAnonymous(): void;

  signInInsideViewer(currentDocument: IDocumentBase): void;
}

export const authService: AuthService;

export default authService;
