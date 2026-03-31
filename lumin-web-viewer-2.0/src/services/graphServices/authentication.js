import {
  VERIFY_SHARING_DOCUMENT_TOKEN,
  GET_ME,
  VERIFY_NEW_USER_INVITATION_TOKEN,
  VALIDATE_IP_WHITELIST,
} from 'graphQL/AuthGraph';

import { FETCH_POLICY } from 'constants/graphConstant';

import { client } from '../../apollo';

export function getMe({ invitationToken, skipOnboardingFlow, isEnabledNewLayout }) {
  return client.query({
    query: GET_ME,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      invitationToken,
      skipOnboardingFlow,
      timezoneOffset: new Date().getTimezoneOffset(),
      isEnabledNewLayout,
    },
  });
}

export function verifySharingDocumentToken(sharingToken) {
  return client.query({
    query: VERIFY_SHARING_DOCUMENT_TOKEN,
    variables: {
      sharingToken,
    },
  });
}

export async function verifyNewUserInvitationToken(token) {
  const res = await client.query({
    query: VERIFY_NEW_USER_INVITATION_TOKEN,
    variables: {
      token,
    },
  });

  return res.data.verifyNewUserInvitationToken;
}

export async function validateIPWhitelist(email) {
  const res = await client.query({
    query: VALIDATE_IP_WHITELIST,
    variables: {
      email,
    },
  });

  return res.data.validateIPWhitelist;
}

export default {
  verifySharingDocumentToken,
  getMe,
};
