import { gql } from '@apollo/client';

import Fragments from './Fragment';

const UPDATE_USER_DATA = gql`
  mutation updateUserData($input: NewDataInput!) {
    updateUserData(input: $input) {
      user {
        ...UserData
      }
      statusCode
      message
    }
  }
  ${Fragments.UserData}
`;

const UPDATE_META_DATA_OF_USER = gql`
  mutation updateUserMetadata($input: UserMetadataInput!) {
    updateUserMetadata(input: $input) {
      user {
        ...UserData
      }
      statusCode
      message
    }
  }
  ${Fragments.UserData}
`;

const FIND_USER = gql`
  query FindUser($input: FindUserInput) {
    findUser(input: $input) {
      _id
      name
      email
      avatarRemoteId
      status
      grantedPermission
    }
  }
`;

const UNSUSBSCRIBE_EMAIL_MARKETING = gql`
  mutation UnsubscribeEmailMarketing($input: UnsubscribeEmailMarketingInput!) {
    unsubscribeEmailMarketing(input: $input) {
      message
      statusCode
    }
  }
`;

const SEEN_NEW_NOTIFICATIONS_TAB = gql`
  mutation seenNewNotificationsTab($tab: NotificationTab!) {
    seenNewNotificationsTab(tab: $tab) {
      ...UserNewNotificationsData
    }
  }
  ${Fragments.UserNewNotificationsData}
`;

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($clientId: ID!) {
    deleteAccount(clientId: $clientId) {
      deletedAt
      payment {
        type
        period
        status
        currency
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        productId
      }
    }
  }
`;

const UPDATE_SETTING = gql`
  mutation UpdateSetting($input: UpdateSettingInput!) {
    updateSetting(input: $input) {
      ...UserData
    }
  }
  ${Fragments.UserData}
`;

const DELETE_SIGNATURE_BY_ID = gql`
  mutation DeleteSignatureById($index: Int!) {
    deleteSignatureByIndex(index: $index) {
      ...UserData
    }
  }
  ${Fragments.UserData}
`;

const DELETE_SIGNATURE_BY_REMOTE_ID = gql`
  mutation deleteSignatureByRemoteId($signatureRemoteId: String!) {
    deleteSignatureByRemoteId(signatureRemoteId: $signatureRemoteId) {
      ...UserData
    }
  }
  ${Fragments.UserData}
`;

const UPDATE_SIGNATURE_POSITION = gql`
  mutation updateSignaturePosition($input: UpdateSignaturePositionInput!) {
    updateSignaturePosition(input: $input) {
      statusCode
      message
    }
  }
`;

const CHECK_LOGIN_EXTERNAL = gql`
  query CheckLoginExternal {
    checkLoginExternal {
      external
    }
  }
`;

const UPDATE_USER_TYPE = gql`
  mutation updateUserType($landingPageToken: String!) {
    updateUserType(landingPageToken: $landingPageToken) {
      type
      message
      statusCode
    }
  }
`;

const DELETE_PERSONAL_DATA = gql`
  mutation deletePersonalEvents {
    deletePersonalEvents {
      statusCode
      message
    }
  }
`;

const CHECK_TEAM_MIGRATION = gql`
  query checkTeamMigration {
    checkTeamMigration
  }
`;

const DELETE_ACCOUNT_SUB = gql`
  subscription deleteAccountSubscription {
    deleteAccountSubscription {
      user {
        _id
      }
      fromProvisioning
    }
  }
`;

const UPDATE_USER_SUBSCRIPTION = gql`
  subscription updateUserSubscription {
    updateUserSubscription {
      type
      user {
        ...UserData
      }
      metadata {
        migratedOrg {
          _id
          name
          url
        }
      }
    }
  }
  ${Fragments.UserData}
`;

const HIDE_GOOGLE_RATING_MODAL = gql`
  mutation hideRatingModal {
    hideRatingModal {
      ...UserData
    }
  }
  ${Fragments.UserData}
`;

const REACTIVATE_ACCOUNT = gql`
  mutation reactivateUser {
    reactivateUser {
      _id
      deletedAt
      payment {
        type
        period
        status
        currency
        customerRemoteId
        subscriptionRemoteId
        planRemoteId
        productId
      }
    }
  }
`;

const SAVE_AUTO_SYNC_TRIAL = gql`
  mutation saveAutoSyncTrial {
    saveAutoSyncTrial {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const SAVE_HUBSPOT_AB_SIGNATURE = gql`
  mutation saveAbSignatureHubspot {
    saveAbSignatureHubspot {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_CURRENT_USER = gql`
  query getCurrentUser {
    getCurrentUser {
      ...UserData
      hasJoinedOrg
    }
  }
  ${Fragments.UserData}
`;

const SEEN_NEW_VERSION = gql`
  mutation seenNewVersion {
    seenNewVersion {
      ...UserData
    }
  }
  ${Fragments.UserData}
`;

const CONFIRM_UPDATING_ANNOT_OF_ANOTHER = gql`
  mutation confirmUpdatingAnnotOfAnother($input: ConfirmUpdatingAnnotInput) {
    confirmUpdatingAnnotOfAnother(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const TRACK_DOWNLOAD_CLICKED_EVENT = gql`
  mutation trackDownloadClickedEvent {
    trackDownloadClickedEvent {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const SAVE_HUBSPOT_PROPERTIES = gql`
  mutation saveHubspotProperties($input: HubspotPropertiesInput!) {
    saveHubspotProperties(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_GOOGLE_CONTACTS = gql`
  query getGoogleContacts($accessToken: String!, $input: GetGoogleContactInput) {
    getGoogleContacts(accessToken: $accessToken, input: $input) {
      name
      email
      avatarRemoteId
      remoteName
    }
  }
`;

const GET_USERS_SAME_DOMAIN = gql`
  query getUsersSameDomain {
    getUsersSameDomain {
      _id
      name
      email
      avatarRemoteId
      status
    }
  }
`;

const GET_SUGGESTED_CIRCLE_LIST_OF_USER = gql`
  query getSuggestedOrgListOfUser {
    getSuggestedOrgListOfUser {
      _id
      name
      avatarRemoteId
      url
      domain
      totalMember
      settings {
        domainVisibility
      }
      status
      members(options: { limit: 4 }) {
        _id
        name
        avatarRemoteId
      }
      payment {
        type
        status
      }
      hashedIpAddresses
    }
  }
`;

const GET_CURRENCY_BASE_ON_LOCATION = gql`
  query getUserCurrency {
    getUserCurrency {
      currency
    }
  }
`;

const UPDATE_DEFAULT_WORKSPACE = gql`
  mutation updateDefaultWorkspace($orgId: ID!) {
    updateDefaultWorkspace(orgId: $orgId) {
      ...UserData
    }
  }
  ${Fragments.UserData}
`;

const RATED_APP = gql`
  mutation ratedApp($input: RatedAppInput!) {
    ratedApp(input: $input) {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const GET_USER_SIGNATURE_SIGNED_URLS = gql`
  query getUserSignatureSignedUrls {
    getUserSignatureSignedUrls {
      remoteId
      presignedUrl
    }
  }
`;

const GET_USER_SIGNATURE_SIGNED_URLS_IN_RANGE = gql`
  query getUserSignatureSignedUrlsInRange($input: GetSignedUrlSignaturesInput!) {
    getUserSignatureSignedUrlsInRange(input: $input) {
      signatures {
        remoteId
        presignedUrl
      }
      hasNext
      offset
      limit
      total
    }
  }
`;

const GET_ONEDRIVE_TOKEN = gql`
  query getOnedriveToken {
    getOnedriveToken {
      accessToken
      expiredAt
      email
      oid
    }
  }
`;

const DISMISS_WORKSPACE_BANNER = gql`
  mutation dismissWorkspaceBanner {
    dismissWorkspaceBanner {
      ...BasicResponseData
    }
  }
  ${Fragments.BasicResponseData}
`;

const ACCEPT_NEW_TERMS_OF_USE = gql`
  mutation acceptNewTermsOfUse($input: AcceptNewTermsOfUseInput) {
    acceptNewTermsOfUse(input: $input) {
      user {
        ...UserData
      }
      statusCode
      message
    }
  }
  ${Fragments.UserData}
`;

export {
  HIDE_GOOGLE_RATING_MODAL,
  UPDATE_USER_DATA,
  UPDATE_META_DATA_OF_USER,
  FIND_USER,
  DELETE_ACCOUNT,
  SEEN_NEW_NOTIFICATIONS_TAB,
  UPDATE_SETTING,
  UNSUSBSCRIBE_EMAIL_MARKETING,
  DELETE_SIGNATURE_BY_ID,
  CHECK_LOGIN_EXTERNAL,
  UPDATE_USER_TYPE,
  DELETE_PERSONAL_DATA,
  CHECK_TEAM_MIGRATION,
  DELETE_ACCOUNT_SUB,
  UPDATE_USER_SUBSCRIPTION,
  REACTIVATE_ACCOUNT,
  SAVE_AUTO_SYNC_TRIAL,
  SAVE_HUBSPOT_AB_SIGNATURE,
  GET_CURRENT_USER,
  SEEN_NEW_VERSION,
  CONFIRM_UPDATING_ANNOT_OF_ANOTHER,
  TRACK_DOWNLOAD_CLICKED_EVENT,
  SAVE_HUBSPOT_PROPERTIES,
  GET_GOOGLE_CONTACTS,
  GET_USERS_SAME_DOMAIN,
  GET_SUGGESTED_CIRCLE_LIST_OF_USER,
  GET_CURRENCY_BASE_ON_LOCATION,
  UPDATE_DEFAULT_WORKSPACE,
  RATED_APP,
  GET_USER_SIGNATURE_SIGNED_URLS,
  DELETE_SIGNATURE_BY_REMOTE_ID,
  GET_USER_SIGNATURE_SIGNED_URLS_IN_RANGE,
  UPDATE_SIGNATURE_POSITION,
  GET_ONEDRIVE_TOKEN,
  DISMISS_WORKSPACE_BANNER,
  ACCEPT_NEW_TERMS_OF_USE,
};
