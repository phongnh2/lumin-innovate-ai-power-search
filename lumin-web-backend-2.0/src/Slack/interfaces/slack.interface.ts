import { Types } from 'mongoose';

export interface InstallURLOptions {
  scopes: string | string[];
  userScopes?: string | string[];
  teamId?: string;
}

export interface ISlackConnectionModel {
  userId: Types.ObjectId;
  slackTeamId: string;
  credential: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISlackConnection extends ISlackConnectionModel {
  _id: string;
}

export interface SlackCredentialInfo {
  accessToken: string;
  userId: string;
  scope: string;
}

export interface SlackConnectionCredential {
  bot: SlackCredentialInfo;
  user: SlackCredentialInfo;
}

export interface SlackOAuthJwtPayload {
  flowId: string;
  userId: string;
  email: string;
}

export enum SlackOAuthErrorType {
  SOMETHING_WENT_WRONG = 'something_went_wrong',
  DIFFERENT_EMAIL_ADDRESS = 'different_email_address',
  CANCELLED_BY_USER = 'cancelled_by_user',
}

export interface SlackOAuthCallbackResponse {
  isOk: boolean;
  flowId: string;
  errorType?: SlackOAuthErrorType;
  teamId?: string;
}

export interface SlackConnection {
  userId: string;
  slackTeamId: string;
  slackUserId: string;
  credential: string;
}

export enum SlackSMBNotificationType {
  STARTED_TRIAL = 'started_trial',
  CANCELED_TRIAL = 'canceled_trial',
  SCHEDULED_CANCELLATION = 'scheduled_cancellation',
  EXPERIENCES_RENEWAL_ISSUES = 'experiences_renewal_issues',
}
