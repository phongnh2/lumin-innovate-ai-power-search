/// <reference path="./authActions.d.ts" />
// ----------------------------- Dev by Lumin --------------------------------
import { get } from 'lodash';
import { flushSync } from 'react-dom';

import axios from '@libs/axios';

import { getCurrentUser } from 'services/userServices';

import authenticationObserver from 'helpers/authenticationObserver';
import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';
import { FREE_USER_SIGN_PAYMENT } from 'constants/paymentConstant';

export const fetchCurrentUser = () => async (dispatch) => {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }
  dispatch({ type: 'UPDATE_CURRENT_USER', payload: { data: user } });
};

export const setCurrentUser = (currentUser) => (dispatch) => {
  dispatch({ type: 'SET_CURRENT_USER', payload: { currentUser } });
};

export const updateCurrentUser = (data) => (dispatch) => {
  dispatch({ type: 'UPDATE_CURRENT_USER', payload: { data } });
};

export const setCurrentDocument = (document) => (dispatch) => {
  dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: { document } });
};

export const updateCurrentDocument = (data) => (dispatch) => {
  dispatch({ type: 'UPDATE_CURRENT_DOCUMENT', payload: { data } });
};

export const startFetchingCurrentDocument = () => (dispatch) => {
  dispatch({ type: 'START_FETCHING_CURRENT_DOCUMENT' });
};

export const fetchingCurrentDocumentComplete = (currentDocument) => (dispatch) => {
  dispatch({ type: 'FETCHING_CURRENT_DOCUMENT_COMPLETE', payload: { currentDocument } });
};

export const fetchingCurrentDocumentError = () => (dispatch) => {
  dispatch({ type: 'FETCHING_CURRENT_DOCUMENT_ERROR' });
};

export const resetCurrentDocument = () => (dispatch) => {
  dispatch({ type: 'RESET_CURRENT_DOCUMENT' });
};

export const signOutUser = () => (dispatch) => {
  dispatch({ type: 'CANCEL_ALL_UPLOADING_FILES' });
  flushSync(() => {
    dispatch({ type: 'USER_LOGGED_OUT' });
  });
};

export const setDeletePassword = (password) => (dispatch) => {
  dispatch({ type: 'SET_DELETE_PASSWORD', payload: { password } });
};

export const setOffline = (isOffline) => (dispatch) => {
  dispatch({ type: 'SET_OFFLINE', payload: { isOffline } });
};

export const setSubMenuType = (subMenuType) => (dispatch) => {
  dispatch({ type: 'SET_SUB_MENU_TYPE', payload: { subMenuType } });
};

export const loadGapiSuccess = () => (dispatch) =>
  dispatch({
    type: 'LOAD_GAPI_SUCCESS',
  });

export const setSourceDownloading = (isSourceDownloading) => (dispatch) => {
  dispatch({ type: 'SET_SOURCE_DOWNLOADING', payload: { isSourceDownloading } });
};

export const updateLocationCurrency = (currency) => ({
  type: 'UPDATE_LOCATION_CURRENCY',
  payload: { currency },
});

export const updateLastAccessOrg = (url) => (dispatch, getState) => {
  const state = getState();

  const { data: organizations } = state.organization.organizations;

  const fallbackUrl = get(organizations, '[0].organization.url');
  dispatch(
    updateCurrentUser({
      lastAccessedOrgUrl: url || fallbackUrl,
    })
  );
};

export const setIsAuthenticating = (isAuthenticating) => ({
  type: 'SET_IS_AUTHENTICATING',
  payload: {
    isAuthenticating,
  },
});

export const setWrongIpStatus = ({ open, email }) => ({
  type: 'SET_WRONG_IP_STATUS',
  payload: { open, email },
});

export const setMembershipOfOrg = ({ require, email }) => ({
  type: 'SET_MEMBERSHIP_OF_ORG',
  payload: { require, email },
});

export const setLanguage = (language) => ({
  type: 'SET_LANGUAGE',
  payload: { language },
});

export const loadUserLocationSuccess = () => (dispatch) => {
  dispatch({
    type: 'LOAD_USER_LOCATION_SUCCESS',
  });
};

export const fetchUserPaymentInfoFromLuminSign = () => async (dispatch) => {
  try {
    const res = await axios.axiosLuminSignInstance.get('/user/get-user-aggregation-properties');
    const payment = res.data.user?.payment || FREE_USER_SIGN_PAYMENT;

    dispatch({
      type: 'SET_USER_SIGN_PAYMENT',
      payload: { userSignPayment: payment },
    });
  } catch (error) {
    logger.logError({
      reason: LOGGER.Service.NETWORK_ERROR,
      error,
      message: "Can't get user payment info from Lumin Sign",
    });
  }
};

export const loadGTMSuccess = () => (dispatch) => {
  dispatch({
    type: 'LOAD_GTM_SUCCESS',
  });
};

export const setIsCompletedGettingUserData = (isCompleted) => (dispatch) => {
  dispatch({ type: 'SET_IS_COMPLETED_GETTING_USER_DATA', payload: { isCompletedGettingUserData: isCompleted } });
  authenticationObserver.notify();
};
