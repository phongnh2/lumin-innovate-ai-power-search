/* eslint-disable class-methods-use-this */
import reverse from 'lodash/reverse';
import { batch } from 'react-redux';

import actions from 'actions';

import { cachingFileHandler, storageHandler } from 'HOC/OfflineStorageHOC';

import googleServices from 'services/googleServices';
import { documentGraphServices } from 'services/graphServices';
import * as authGraph from 'services/graphServices/authentication';
import * as orgGraph from 'services/graphServices/organization';
import hubspotServices from 'services/hubspotServices';
import indexedDBService from 'services/indexedDBService';
import { kratosService } from 'services/oryServices';
import { KratosRoutes, ProfileSettingSections } from 'services/oryServices/kratos';
import SocketService from 'services/socketServices';
import * as userServices from 'services/userServices';

import logger from 'helpers/logger';
import { requestIdleCallback } from 'helpers/requestIdleCallback';

import brazeAdapter from 'utils/Factory/BrazeAdapter';
import googleDriveEvent from 'utils/Factory/EventCollection/GoogleDriveEventCollection';
import * as ga from 'utils/ga';
import { getFullPathWithPresetLang } from 'utils/getLanguage';
import LocalStorageUtils from 'utils/localStorage';
import { isUserNeedToJoinOrg, isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';
import { PaymentUrlSerializer } from 'utils/payment';
import { redirectFlowUtils } from 'utils/redirectFlow';

import { formFieldAutocompleteBase } from 'features/FormFieldAutosuggestion';

import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { LOGGER } from 'constants/lumin-common';
import { MAPPING_PLAN_URL_TO_PLAN_TYPE, PERIOD } from 'constants/plan';
import { NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';
import { AXIOS_BASEURL, BASEURL, AUTH_SERVICE_URL } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { client, subscriptionClient } from '../apollo';
import appSocketService from '../navigation/App/helpers/AppSocketService';
import { store } from '../redux/store';
import { socket } from '../socket';

const { dispatch, getState } = store;

class AuthService {
  constructor() {
    this.dispatch = dispatch;
    this.socketService = new SocketService();
    this.socket = socket;
    this.authGraph = authGraph;
    this.orgGraph = orgGraph;
    this.getState = getState;
  }

  getMe({ invitationToken, skipOnboardingFlow, isEnabledNewLayout }) {
    return this.authGraph.getMe({ invitationToken, skipOnboardingFlow, isEnabledNewLayout });
  }

  async afterSignOut({ returnTo } = { returnTo: { url: BASEURL } }, kratosNavigate = undefined) {
    await client.clearStore();
    brazeAdapter.clear();
    subscriptionClient.dispose();
    redirectFlowUtils.deleteCookies();
    formFieldAutocompleteBase.clear();
    googleDriveEvent.totalPopupInSession();
    sessionStorage.clear();
    LocalStorageUtils.clear();
    googleServices.clearGoogleAccessTokenCookie();
    localStorage.setItem('logout', true);
    this.socket.closeConnection();
    this.dispatch(actions.signOutUser());
    hubspotServices.clear();
    if (kratosNavigate) {
      kratosNavigate();
    } else {
      kratosService.signIn(returnTo);
    }
  }

  reverseSignatures(user) {
    const signatures = reverse([...user.signatures]);
    return {
      ...user,
      signatures,
    };
  }

  async signInSuccess({ user }) {
    ga.trackingUser(user._id);
    this.socket.startConnectionWithQuery();
    appSocketService.unsubscribe();
    appSocketService.subscribe();
    await cachingFileHandler.initialize(user);
    this.setupSocketOnSignIn(user._id);
    this.dispatch(actions.fetchMainOrganization());
    hubspotServices.identity(user.email);
    hubspotServices.refreshWidgetWithTimeout();
    await Promise.all([
      this.updateOrganizationList(),
      this.getSuggestedOrgListOfUser(user),
      this.updatePremiumToolsInfo(),
    ]);
    this.dispatch(actions.setCurrentUser(this.reverseSignatures(user)));
  }

  async updateOrganizationList() {
    const organizations = await this.orgGraph.getOrgList();
    this.dispatch(actions.setOrganizations(organizations));
  }

  async updatePremiumToolsInfo() {
    const premiumToolsInfo = await documentGraphServices.getPremiumToolInfoAvailableForUser();
    await indexedDBService.setPremiumToolsInfo(premiumToolsInfo);
  }

  async getSuggestedOrgListOfUser(user) {
    if (user.isPopularDomain) {
      this.dispatch(actions.setSuggestedOrganizations([]));
      return;
    }
    const isSatisfiedUser = isUserNeedToJoinOrg(user);
    if (isSatisfiedUser) {
      try {
        const orgList = await userServices.getSuggestedOrgListOfUser();
        this.dispatch(actions.setSuggestedOrganizations(orgList));
      } catch (error) {
        this.dispatch(actions.setSuggestedOrganizations([]));
      }
    }
  }

  /**
   *
   * @param {string} userId
   */
  setupSocketOnSignIn(userId) {
    this.socketService.addUserToRoom(userId);
    this.socket.authorizeSocket();
    this.socket.onSocketConnected();
  }

  setupSocketForAnonymous() {
    this.socket.releasePendingEvents();
  }

  /**
   *
   * @param {string} sharingToken
   */
  async validateSharingDocumentToken(sharingToken) {
    const { data: { verifySharingDocumentToken } = {} } = await this.authGraph.verifySharingDocumentToken(sharingToken);
    return verifySharingDocumentToken;
  }

  handleRedirectForPricing({ period, promotion, plan, isTrial, navigate }) {
    const planType = MAPPING_PLAN_URL_TO_PLAN_TYPE[plan];
    const planPeriod = period || (isTrial ? PERIOD.MONTHLY : PERIOD.ANNUAL);
    const url = new PaymentUrlSerializer().trial(isTrial).period(planPeriod).plan(planType).get();
    const paymentUrl = promotion ? `${url}?${UrlSearchParam.PROMOTION}=${promotion}` : url;
    navigate(paymentUrl, { replace: true });
  }

  getNewAuthenRedirectUrl(user) {
    const { isPopularDomain } = user;
    const isSatisfiedUser = isUserInNewAuthenTestingScope(user);
    const state = this.getState();
    const suggestedOrgList = state.organization.suggestedOrganizations.data || [];
    if (!isSatisfiedUser) {
      return { url: '' };
    }
    userServices.saveHubspotProperties({ key: HUBSPOT_CONTACT_PROPERTIES.NEW_AUTHEN_FLOW, value: 'true' });

    if (isPopularDomain || !suggestedOrgList.length) {
      return { url: NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION };
    }
    return { url: NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION };
  }

  async cleanOfflineDocuments() {
    const { email: offlineEmail } = await cachingFileHandler.getActiveOfflineUser();
    if (offlineEmail) {
      storageHandler.cleanSource();
      logger.logInfo({
        reason: LOGGER.EVENT.CLEAN_OFFLINE_DOCUMENTS,
      });
    }
  }

  async onPostAuthentication(user) {
    const { metadata } = user;
    dispatch(actions.fetchOrganizations());
    if (!metadata.isHiddenSuggestedOrganization) {
      dispatch(actions.fetchMainOrganization());
    }

    ga.trackingUser(user._id);
    await Promise.all([
      cachingFileHandler.initialize(user),
      this.getSuggestedOrgListOfUser(user),
    ]);
    batch(() => {
      dispatch(actions.setCurrentUser(user));
      dispatch(actions.setIsCompletedGettingUserData(true));
    });
    this.setupSocketOnSignIn(user._id);
    this.cleanOfflineDocuments();
  }

  async onPostAuthenticationForViewer(user) {
    ga.trackingUser(user._id);
    await cachingFileHandler.initialize(user);

    batch(() => {
      dispatch(actions.setCurrentUser(user));
      dispatch(actions.setIsCompletedGettingUserData(true));
    });

    this.setupSocketOnSignIn(user._id);

    requestIdleCallback(() => {
      dispatch(actions.fetchOrganizations());
      dispatch(actions.fetchMainOrganization());
      this.getSuggestedOrgListOfUser(user);
    });
  }

  triggerSessionExpired() {
    /**
     * Need to remove this key because if it remain in localStorage (check authServices.afterSignOut()),
     * it does not trigger the `storage` event if we set the `logout` key again.
     */
    if (localStorage.getItem('logout')) {
      localStorage.removeItem('logout');
    }
    localStorage.setItem('logout', true);
  }

  verifyNewUserInvitationToken(token) {
    return this.authGraph.verifyNewUserInvitationToken(token);
  }

  signInInsideViewer(currentDocument) {
    if (currentDocument.isAnonymousDocument && !currentDocument.temporaryEdit) {
      const { email } = googleServices.getImplicitAccessToken() || {};
      const state = { action: 'open', ids: [currentDocument.remoteId], skipDriveInstall: true };
      const baseUrl = process.env.NODE_ENV === 'development' ? AXIOS_BASEURL : BASEURL;
      const urlOpenGoogle = `return_to=${baseUrl}/open/google?state=${JSON.stringify(state)}`;
      const url = new URL(
        decodeURIComponent(
          AUTH_SERVICE_URL +
            getFullPathWithPresetLang(
              `/profile-settings?highlight=${ProfileSettingSections.GOOGLE_SIGN_IN}&${urlOpenGoogle}`
            )
        )
      );
      kratosService.toKratos(KratosRoutes.SIGN_IN, { url }, {}, { loginHint: email });
    } else {
      kratosService.signIn(true);
    }
  }

  validateIPWhitelist(email) {
    return this.authGraph.validateIPWhitelist(email);
  }
}

export const authService = new AuthService();

export default authService;
