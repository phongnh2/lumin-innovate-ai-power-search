import { capitalize } from 'lodash';

import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

export const THROTTLE_DELAY_TIME = 500;

export const EMAIL_PREFERENCES = {
  DOCUMENT_EMAIL: 'Document Email',
  ORGANIZATION_EMAIL: `${capitalize(ORGANIZATION_TEXT)} Email`,
  MARKETING_EMAIL: 'Marketing Email',
};

export const EMAIL_PREFERENCES_KEY = {
  MARKETING_EMAIL: 'marketingEmail',
  SUBSCRIPTION_EMAIL: 'subscriptionEmail',
  OTHER_EMAIL: 'otherEmail',
  FEATURE_UPDATE_EMAIL: 'featureUpdateEmail',
  DATA_COLLECTION: 'dataCollection',
  SHARE_DOCUMENT: 'shareDocument',
  COMMENT_DOCUMENT: 'commentDocument',
  REPLY_COMMENT_DOCUMENT: 'replyCommentDocument',
  MENTION_COMMENT_DOCUMENT: 'mentionCommentDocument',
  REQUEST_ACCESS_DOCUMENT: 'requestAccessDocument',
  INVITE_TO_ORGANIZATION: 'inviteToOrganization',
  INVITE_TO_ORGANIZATION_TEAM: 'inviteToOrganizationTeam',
};
