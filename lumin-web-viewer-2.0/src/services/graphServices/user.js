/// <reference path="./user.d.ts" />
import {
  FIND_USER,
  UPDATE_USER_TYPE,
  DELETE_PERSONAL_DATA,
  CHECK_TEAM_MIGRATION,
  UPDATE_META_DATA_OF_USER,
  HIDE_GOOGLE_RATING_MODAL,
  REACTIVATE_ACCOUNT,
  SAVE_AUTO_SYNC_TRIAL,
  GET_CURRENT_USER,
  SAVE_HUBSPOT_AB_SIGNATURE,
  SEEN_NEW_VERSION,
  CONFIRM_UPDATING_ANNOT_OF_ANOTHER,
  TRACK_DOWNLOAD_CLICKED_EVENT,
  SAVE_HUBSPOT_PROPERTIES,
  SEEN_NEW_NOTIFICATIONS_TAB,
  GET_GOOGLE_CONTACTS,
  GET_USERS_SAME_DOMAIN,
  GET_SUGGESTED_CIRCLE_LIST_OF_USER,
  GET_CURRENCY_BASE_ON_LOCATION,
  UPDATE_DEFAULT_WORKSPACE,
  UPDATE_USER_SUBSCRIPTION,
  RATED_APP,
  GET_USER_SIGNATURE_SIGNED_URLS,
  GET_USER_SIGNATURE_SIGNED_URLS_IN_RANGE,
  UPDATE_SIGNATURE_POSITION,
  GET_ONEDRIVE_TOKEN,
  DISMISS_WORKSPACE_BANNER,
  ACCEPT_NEW_TERMS_OF_USE,
} from 'graphQL/UserGraph';

import errorUtils from 'utils/error';

import { FETCH_POLICY } from 'constants/graphConstant';
import { SIGN_BACKEND_URL } from 'constants/urls';

import { client } from '../../apollo';

export async function findUser({ searchKey, targetType, targetId, excludeUserIds }) {
  const res = await client.query({
    query: FIND_USER,
    variables: {
      input: {
        searchKey,
        targetType,
        targetId,
        excludeUserIds,
      },
    },
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });
  return res.data.findUser;
}

export async function updateUserType(landingPageToken) {
  try {
    const res = await client.mutate({
      mutation: UPDATE_USER_TYPE,
      variables: {
        landingPageToken,
      },
    });
    return res.data;
  } catch (err) {
    return { updateUserType: { type: null } };
  }
}

export async function deletePersonalData() {
  const res = await client.mutate({
    mutation: DELETE_PERSONAL_DATA,
  });

  return res.data;
}

export async function checkTeamMigration() {
  const res = await client.query({
    query: CHECK_TEAM_MIGRATION,
    fetchPolicy: FETCH_POLICY.CACHE_FIRST,
  });

  const result = res.data.checkTeamMigration;

  client.writeQuery({
    query: CHECK_TEAM_MIGRATION,
    data: {
      checkTeamMigration: false,
    },
  });

  return result;
}

export async function updateUserMetadata(input) {
  const res = await client.mutate({
    mutation: UPDATE_META_DATA_OF_USER,
    variables: {
      input,
    },
  });

  return res.data;
}

export async function hideGoogleRatingModal() {
  const res = await client.mutate({
    mutation: HIDE_GOOGLE_RATING_MODAL,
  });
  return res.data.hideRatingModal;
}

export async function reactiveAccount() {
  const res = await client.mutate({
    mutation: REACTIVATE_ACCOUNT,
    fetchPolicy: FETCH_POLICY.NO_CACHE,
  });

  return res.data.reactivateUser;
}

export async function saveAutoSyncTrial() {
  const res = await client.mutate({
    mutation: SAVE_AUTO_SYNC_TRIAL,
  });

  return res.data.saveAutoSyncTrial;
}

export async function saveHubspotAbSignature() {
  const res = await client.mutate({
    mutation: SAVE_HUBSPOT_AB_SIGNATURE,
  });

  return res.data.saveHubspotAbSignature;
}

export async function getCurrentUser() {
  const res = await client.query({
    query: GET_CURRENT_USER,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getCurrentUser;
}

export async function seenNewVersion() {
  const res = await client.mutate({
    mutation: SEEN_NEW_VERSION,
  });
  return res.data.seenNewVersion;
}

export async function confirmUpdateAnnotation({ authorEmails, action, remoteId, documentId }) {
  try {
    const {
      data: {
        confirmUpdatingAnnotOfAnother: { message, statusCode },
      },
    } = await client.mutate({
      mutation: CONFIRM_UPDATING_ANNOT_OF_ANOTHER,
      variables: {
        input: {
          authorEmails,
          action,
          remoteId,
          documentId,
        },
      },
    });
    return {
      message,
      statusCode,
    };
  } catch (err) {
    const { message, statusCode } = errorUtils.extractGqlError(err);
    return {
      message,
      statusCode,
    };
  }
}

export async function trackDownloadClickedEvent() {
  return client.mutate({
    mutation: TRACK_DOWNLOAD_CLICKED_EVENT,
  });
}

export async function saveHubspotProperties({ key, value }) {
  const res = await client.mutate({
    mutation: SAVE_HUBSPOT_PROPERTIES,
    variables: {
      input: {
        key,
        value,
      },
    },
  });
  return res.data.saveHubspotProperties;
}

export async function seenNewNotificationsTab(tab) {
  const res = await client.mutate({
    mutation: SEEN_NEW_NOTIFICATIONS_TAB,
    variables: {
      tab,
    },
  });
  return res.data.seenNewNotificationsTab;
}

export async function getGoogleContacts(accessToken, input) {
  const res = await client.query({
    query: GET_GOOGLE_CONTACTS,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
    variables: {
      accessToken,
      input,
    },
  });
  return res.data.getGoogleContacts;
}

export async function getUsersSameDomain() {
  const res = await client.query({
    query: GET_USERS_SAME_DOMAIN,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getUsersSameDomain;
}

export async function getSuggestedOrgListOfUser() {
  const res = await client.query({
    query: GET_SUGGESTED_CIRCLE_LIST_OF_USER,
    fetchPolicy: FETCH_POLICY.NETWORK_ONLY,
  });
  return res.data.getSuggestedOrgListOfUser;
}

export async function getCurrencyBaseOnLocation() {
  const res = await client.query({
    query: GET_CURRENCY_BASE_ON_LOCATION,
  });
  return res.data.getUserCurrency;
}

export async function updateDefaultWorkspace(orgId) {
  const res = await client.mutate({
    mutation: UPDATE_DEFAULT_WORKSPACE,
    variables: {
      orgId,
    },
  });
  return res.data.updateDefaultWorkspace;
}

export function updateUserSubscription({ onNext, onError }) {
  return client
    .subscribe({
      query: UPDATE_USER_SUBSCRIPTION,
    })
    .subscribe({
      next({ data }) {
        onNext(data.updateUserSubscription);
      },
      error(e) {
        onError(e);
      },
    });
}

export async function ratedApp({ ratedScore }) {
  const rateResult = await client.mutate({
    mutation: RATED_APP,
    variables: {
      input: {
        ratedScore,
      },
    },
  });
  return rateResult.data.ratedApp;
}

export async function getUserSignatureSignedUrls() {
  const res = await client.query({
    query: GET_USER_SIGNATURE_SIGNED_URLS,
    fetchPolicy: 'no-cache',
  });
  return res.data.getUserSignatureSignedUrls;
}

export async function getUserSignatureSignedUrlsInRange({ limit, offset }) {
  const res = await client.query({
    query: GET_USER_SIGNATURE_SIGNED_URLS_IN_RANGE,
    fetchPolicy: 'no-cache',
    variables: {
      input: {
        limit,
        offset,
      },
    },
  });
  return res.data.getUserSignatureSignedUrlsInRange;
}

export async function updateSignaturePosition({ signatureRemoteId, toPosition }) {
  const rateResult = await client.mutate({
    mutation: UPDATE_SIGNATURE_POSITION,
    variables: {
      input: {
        signatureRemoteId,
        toPosition,
      },
    },
  });
  return rateResult.data.updateSignaturePosition;
}

export async function getOnedriveToken() {
  const result = await client.query({
    query: GET_ONEDRIVE_TOKEN,
    fetchPolicy: 'no-cache',
  });
  return result.data.getOnedriveToken;
}

export async function dismissWorkspaceBanner() {
  const result = await client.mutate({
    mutation: DISMISS_WORKSPACE_BANNER,
    fetchPolicy: 'no-cache',
    context: {
      uri: `${SIGN_BACKEND_URL}/graphql`,
    },
  });

  return result.data.dismissWorkspaceBanner;
}

export async function acceptNewTermsOfUse(acceptTermsForUserInput) {
  const res = await client.mutate({
    mutation: ACCEPT_NEW_TERMS_OF_USE,
    variables: {
      input: acceptTermsForUserInput,
    },
  });
  return res.data.acceptNewTermsOfUse;
}

export default {
  hideGoogleRatingModal,
  findUser,
  updateUserType,
  deletePersonalData,
  checkTeamMigration,
  saveAutoSyncTrial,
  saveHubspotAbSignature,
  getCurrentUser,
  seenNewVersion,
  confirmUpdateAnnotation,
  saveHubspotProperties,
  seenNewNotificationsTab,
  getSuggestedOrgListOfUser,
  getCurrencyBaseOnLocation,
  updateUserSubscription,
  getUserSignatureSignedUrls,
  getUserSignatureSignedUrlsInRange,
  updateSignaturePosition,
  getOnedriveToken,
  acceptNewTermsOfUse,
};
