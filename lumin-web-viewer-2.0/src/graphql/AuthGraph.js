import { gql } from '@apollo/client';

import Fragments from './Fragment';

const SIGN_IN_BY_GOOGLE_V2 = gql`
  mutation signInByGoogleV2($signInByGoogleInput: SignInByGoogleInputV2!) {
    signInByGoogleV2(input: $signInByGoogleInput) {
      token
      refreshToken
      user {
        ...UserData
        hasJoinedOrg
      }
      isSignedUp
      scope
    }
  }
  ${Fragments.UserData}
`;

const GET_ME = gql`
  query getMe($timezoneOffset: Int, $invitationToken: String, $skipOnboardingFlow: Boolean, $isEnabledNewLayout: Boolean) {
    getMe(timezoneOffset: $timezoneOffset, invitationToken: $invitationToken, skipOnboardingFlow: $skipOnboardingFlow, isEnabledNewLayout: $isEnabledNewLayout) {
      token
      user {
        ...UserData
        hasJoinedOrg
      }
    }
  }
  ${Fragments.UserData}
`;

const SIGN_UP_WITH_INVITATION = gql`
  mutation signUpWithInvite($input: SignUpInvitationInput!) {
    signUpWithInvite(input: $input) {
      message
      statusCode
      userId
    }
  }
`;

const VERIFY_SHARING_DOCUMENT_TOKEN = gql`
  query verifySharingDocumentToken($sharingToken: String!) {
    verifySharingDocumentToken(sharingToken: $sharingToken) {
      email
      documentName
      linkType
      documentId
      isSignedUp
    }
  }
`;

const VERIFY_NEW_USER_INVITATION_TOKEN = gql`
  query verifyNewUserInvitationToken($token: String!) {
    verifyNewUserInvitationToken(token: $token) {
      type
      email
      status
      newAuthProcessing
      metadata {
        orgId
        documentId
        orgUrl
        orgName
        invitationId
      }
    }
  }
`;

const VALIDATE_IP_WHITELIST = gql`
  query validateIPWhitelist($email: String!) {
    validateIPWhitelist(email: $email) {
      message
      statusCode
    }
  }
`;

export {
  GET_ME,
  SIGN_UP_WITH_INVITATION,
  VERIFY_SHARING_DOCUMENT_TOKEN,
  SIGN_IN_BY_GOOGLE_V2,
  VERIFY_NEW_USER_INVITATION_TOKEN,
  VALIDATE_IP_WHITELIST,
};
