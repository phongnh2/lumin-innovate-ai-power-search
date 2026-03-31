/// <reference path="./userServices.d.ts" />
import { isEqual, uniqWith, get } from 'lodash';

import Axios from '@libs/axios';
import { setCurrentUser, updateCurrentUser } from 'actions/authActions';
import { socket } from 'src/socket';

import selectors from 'selectors';

import * as userGraph from 'services/graphServices/user';

import logger from 'helpers/logger';

import { LOGIN_SERVICES } from 'constants/authConstant';
import { ENTITY, LOGGER } from 'constants/lumin-common';
import { Plans, PLAN_TYPE, ORDINAL_PLAN_TYPE } from 'constants/plan';
import { SOCKET_EMIT } from 'constants/socketConstant';

import authService from './authServices';
import googleServices from './googleServices';
import { store } from '../redux/store';

const { dispatch } = store;
/**
 *
 * @param {object} user
 * @param {array} teams
 */

export function getPlanType(user, userOrgs = []) {
  const paymentType = user?.payment?.type || Plans.FREE;
  const highestPlan = { entity: ENTITY.INDIVIDUAL, payment: { type: paymentType } };
  const specialPlans = {
    [Plans.FREE_TRIAL]: PLAN_TYPE.FREE_TRIAL,
    [Plans.PROFESSIONAL]: PLAN_TYPE.PROFESSIONAL,
    [Plans.PERSONAL]: PLAN_TYPE.PERSONAL,
  };
  if (paymentType !== Plans.FREE) {
    highestPlan.payment = { type: specialPlans[paymentType] || PLAN_TYPE.PREMIUM };
    return highestPlan;
  }
  if (userOrgs.some(({ organization }) => organization.payment.type === PLAN_TYPE.ENTERPRISE)) {
    return { entity: ENTITY.ORGANIZATION, payment: { type: PLAN_TYPE.ENTERPRISE } };
  }
  if (userOrgs.some(({ organization }) => organization.payment.type === PLAN_TYPE.BUSINESS)) {
    return { entity: ENTITY.ORGANIZATION, payment: { type: PLAN_TYPE.BUSINESS } };
  }
  return highestPlan;
}

export function getHighestPlan(user, userOrgs = []) {
  const { type, priceVersion } = get(user, 'payment', { type: Plans.FREE, priceVersion: 0 });

  const highestPlan = { type, priceVersion };
  let userPlans = userOrgs.map((org) => {
    const paymentType = org.organization.payment.type || '';
    return {
      type: paymentType,
      priceVersion: org.organization.payment.priceVersion || 0,
      ordinal: ORDINAL_PLAN_TYPE[paymentType],
    };
  });

  if (userPlans.length > 0) {
    if (userPlans.length <= 1) {
      return { ...userPlans[0] };
    }
    userPlans = uniqWith(userPlans, isEqual).sort((orgA, orgB) => orgA.ordinal - orgB.ordinal);
    return { ...userPlans[0] };
  }

  return highestPlan;
}

export async function findUser(input) {
  return userGraph.findUser(input);
}

export async function updateUserType(landingPageToken) {
  const state = store.getState();
  const currentUser = selectors.getCurrentUser(state);
  const {
    updateUserType: { type },
  } = await userGraph.updateUserType(landingPageToken);
  if (!type) {
    return '';
  }
  dispatch(setCurrentUser({ ...currentUser, type }));
  return type;
}

export function deletePersonalData() {
  return userGraph.deletePersonalData();
}

export function isInternalOrgUser(userEmail, orgDomain) {
  return orgDomain === userEmail.split('@')[1];
}

export function isUserWithAssociateDomain(userEmail, associateDomains) {
  if (!associateDomains || !associateDomains.length) {
    return false;
  }
  return associateDomains.includes(userEmail.split('@')[1]);
}

export async function confirmShownAutoSyncModal() {
  return userGraph.updateUserMetadata({
    key: 'hasShownAutoSyncModal',
    value: true,
  });
}

export async function updateUserMetadata({ key, value }) {
  await userGraph.updateUserMetadata({ key, value });
  dispatch(updateCurrentUser({ metadata: { [key]: value } }));
}

export function isUserLoginWithGoogle({ loginService }) {
  logger.logInfo({
    message: LOGGER.EVENT.IS_USER_LOGIN_WITH_GOOGLE,
    reason: LOGGER.Service.GOOGLE_API_INFO,
  });
  return googleServices.isSignedInWithGoolge(loginService);
}

export function isUserLoginWithDropbox({ loginService }) {
  return loginService === LOGIN_SERVICES.DROPBOX;
}

export function hideGoogleRatingModal() {
  return userGraph.hideGoogleRatingModal();
}

export async function reactiveAccount() {
  await Axios.axiosLuminAuth.patch('user/reactivate-account');
  const { data } = await authService.getMe({});
  const { user: updatedUser } = data.getMe;
  socket.emit(SOCKET_EMIT.REACTIVE_USER_ACCOUNT, { userId: updatedUser._id });
  dispatch(updateCurrentUser(updatedUser));
}

export function saveAutoSyncTrial() {
  return userGraph.saveAutoSyncTrial();
}

export function saveHubspotAbSignature() {
  return userGraph.saveHubspotAbSignature();
}

export function getCurrentUser() {
  return userGraph.getCurrentUser();
}

export function seenNewVersion() {
  return userGraph.seenNewVersion();
}

export function confirmUpdateAnnotation(input) {
  return userGraph.confirmUpdateAnnotation(input);
}

export function trackDownloadClickedEvent() {
  return userGraph.trackDownloadClickedEvent();
}

export function saveHubspotProperties(input) {
  return userGraph.saveHubspotProperties(input);
}
export function seenNewNotificationsTab(tab) {
  return userGraph.seenNewNotificationsTab(tab);
}

export function getGoogleContacts(accessToken, input) {
  return userGraph.getGoogleContacts(accessToken, input);
}

export function getUsersSameDomain() {
  return userGraph.getUsersSameDomain();
}

export function getSuggestedOrgListOfUser() {
  return userGraph.getSuggestedOrgListOfUser();
}

export function getCurrencyBaseOnLocation() {
  return userGraph.getCurrencyBaseOnLocation();
}

export function updateDefaultWorkspace(orgId) {
  return userGraph.updateDefaultWorkspace(orgId);
}

export function updateUserSubscription({ onNext, onError }) {
  return userGraph.updateUserSubscription({ onNext, onError });
}

export function ratedApp({ ratedScore }) {
  return userGraph.ratedApp({ ratedScore });
}

export function getUserSignatureSignedUrls() {
  return userGraph.getUserSignatureSignedUrls();
}

export function getUserSignatureSignedUrlsInRange({ limit, offset }) {
  return userGraph.getUserSignatureSignedUrlsInRange({ limit, offset });
}

export function updateSignaturePosition({ signatureRemoteId, toPosition }) {
  return userGraph.updateSignaturePosition({ signatureRemoteId, toPosition });
}

export function getOnedriveToken() {
  return userGraph.getOnedriveToken();
}

export function dismissWorkspaceBanner() {
  return userGraph.dismissWorkspaceBanner();
}

export function acceptNewTermsOfUse(acceptTermsForUserInput) {
  return userGraph.acceptNewTermsOfUse(acceptTermsForUserInput);
}

export function isUserLoginWithSamlSso({ loginService }) {
  return loginService === LOGIN_SERVICES.SAML_SSO;
}

export default {
  getPlanType,
  findUser,
  deletePersonalData,
  isUserLoginWithGoogle,
  isUserLoginWithDropbox,
  isInternalOrgUser,
  isUserWithAssociateDomain,
  hideGoogleRatingModal,
  reactiveAccount,
  saveAutoSyncTrial,
  getCurrentUser,
  saveHubspotAbSignature,
  seenNewVersion,
  confirmUpdateAnnotation,
  trackDownloadClickedEvent,
  saveHubspotProperties,
  updateUserMetadata,
  seenNewNotificationsTab,
  getGoogleContacts,
  getUsersSameDomain,
  getSuggestedOrgListOfUser,
  getCurrencyBaseOnLocation,
  updateDefaultWorkspace,
  updateUserSubscription,
  getUserSignatureSignedUrls,
  getUserSignatureSignedUrlsInRange,
  updateSignaturePosition,
  getOnedriveToken,
  dismissWorkspaceBanner,
  acceptNewTermsOfUse,
  ratedApp,
  getHighestPlan,
  isUserLoginWithSamlSso,
};
