import { DiscardModal } from '../constants/customConstant';

export type GoogleUsersNotInCircleParams = {
  orgId: string;
  googleAuthorizationEmail: string;
  shareEmails: string[];
};

export type DiscardModalType = typeof DiscardModal[keyof typeof DiscardModal];
