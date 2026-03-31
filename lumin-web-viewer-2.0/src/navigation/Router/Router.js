/* eslint-disable class-methods-use-this */
/* eslint-disable react/jsx-no-constructed-context-values */
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { ReactNotifications } from 'react-notifications-component';
import { connect } from 'react-redux';
import { matchPath, Outlet } from 'react-router';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import Loading from 'luminComponents/Loading';
import SkeletonLoading from 'luminComponents/SkeletonLoading';

import { cachingFileHandler, storageHandler } from 'HOC/OfflineStorageHOC';
import withEnableWebReskin from 'HOC/withEnableWebReskin';
import withRouter from 'HOC/withRouter';

import { isViewerRouteMatch } from 'hooks/useViewerMatch';

import logger from 'helpers/logger';
import { isStandaloneMode, registerServiceWorker } from 'helpers/pwa';

import { isNetworkValid, toastUtils } from 'utils';
import brazeAdaptee from 'utils/Factory/BrazeAdapter/BrazeAdaptee';
import clickEvent from 'utils/Factory/EventCollection/ClickEventCollection';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { CookieConsentEnum } from 'features/cookieConsents/constants';
import { cookieConsents } from 'features/cookieConsents/cookieConsents';
import { isTemplateViewerRouteMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import DownloadFailedModal from 'features/MultipleDownLoad/components/DownloadFailedModal';
import NewPrivacyPolicyModal from 'features/NewPrivacyPolicyModal';
import PromptToJoinTrialingOrgModal from 'features/PromptToJoinTrialingOrgModal';

import { LocalStorageKey } from 'constants/localStorageKey';
import {
  THEME_MODE,
  ModalTypes,
  CHECK_ONLINE_POLLING_TIME,
  CHECK_ONINE_DELAY_TIME,
  LOGGER,
} from 'constants/lumin-common';

import { socket } from '../../socket';
import App from '../App';

const MaterialModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/MaterialModal'));
const Crash = lazyWithRetry(() => import('luminComponents/Crash'));
const LoadingModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/LoadingModal'));
const UploadingBox = lazyWithRetry(() => import('luminComponents/UploadingBox'));
const UploadingPopper = lazyWithRetry(() => import('luminComponents/ReskinLayout/components/UploadingPopper'));
const PasswordModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/PasswordModal'));
const CookieWarningModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'luminComponents/CookieWarningModal')
);
const NoInternetPopup = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/NoInternetPopup'));
const WrongIP = lazyWithRetry(() => import('luminComponents/WrongIP'));
const OrganizationRestriction = lazyWithRetry(() => import('luminComponents/OrganizationRestriction'));
const PromptToUploadLogoModalSingleton = lazyWithRetry(() =>
  import('features/CNC/CncComponents/PromptToUploadLogoModal/PromptToUploadLogoModalSingleton')
);

class Routers extends React.Component {
  state = {
    error: false,
  };

  async componentDidMount() {
    const { location } = this.props;
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'PWA' || isStandaloneMode) {
      window.lMode = 'PWA';
    }
    this.printAppVersionToConsole();
    this.props.authenticate().then(() => {
      import('services/recordServices').then(() => this.props.loadAWSPinpointSuccess());
    });
    try {
      await registerServiceWorker();
      this.estimateBrowserStorage();
    } catch (err) {
      logger.logError({
        reason: LOGGER.Service.COMMON_ERROR,
        error: err,
      });
    }
  }

  componentDidUpdate(prevProps) {
    this.handleInitBrazeUser(prevProps);
    this.handleOnOfflineEvents(prevProps);
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: true,
    });
    logger.logError({
      reason: LOGGER.Service.TECHNICAL_ERROR,
      message: error.message,
      error,
      attributes: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  componentWillUnmount() {
    window.removeEventListener('offline', this.onOffline);
    window.removeEventListener('online', this.onOnline);
    cachingFileHandler.uninitialize();
  }

  handleInitBrazeUser = (prevProps) => {
    const { currentUser, userLocationLoaded } = this.props;
    const { currentUser: prevUser } = prevProps;
    const hasSignedIn = isEmpty(prevUser) && !isEmpty(currentUser);
    const signInWithAnotherAccount = !isEmpty(prevUser) && !isEmpty(currentUser) && prevUser._id !== currentUser._id;
    if (
      cookieConsents.isCookieAllowed(CookieConsentEnum.NonEssential) &&
      (hasSignedIn || signInWithAnotherAccount) &&
      userLocationLoaded
    ) {
      brazeAdaptee.initUser(currentUser);
    }
  };

  handleOnOfflineEvents(prevProps) {
    const { currentUser } = this.props;
    const { currentUser: prevUser } = prevProps;
    const hasSignedIn = isEmpty(prevUser) && !isEmpty(currentUser);
    const hasSignedOut = !isEmpty(prevUser) && isEmpty(currentUser);
    if (hasSignedIn) {
      window.addEventListener('offline', this.onOffline);
      window.addEventListener('online', this.onOnline);
      socket.registerOnlineHandler(this.onOnline);
      this.checkingEnableOffline();
    }
    if (hasSignedOut) {
      window.removeEventListener('offline', this.onOffline);
      window.removeEventListener('online', this.onOnline);
    }
  }

  onOffline = async () => {
    if (!process.env.DEBUG_OFFLINE_MODE) {
      this.startIntervalCheckingRef = setTimeout(() => {
        this.networkIntervalChecking = setInterval(async () => {
          if (await isNetworkValid()) {
            this.onOnline();
          }
        }, CHECK_ONLINE_POLLING_TIME);
      }, CHECK_ONINE_DELAY_TIME);
    }
    this.props.setOffline(true);
  };

  onOnline = () => {
    clearTimeout(this.startIntervalCheckingRef);
    clearInterval(this.networkIntervalChecking);
    this.props.setOffline(false);
    this.checkingEnableOffline();
  };

  checkingEnableOffline = () => {
    const match = matchPath(
      {
        path: '/viewer/:documentId',
        end: false,
      },
      window.location.pathname
    );
    if (!match) {
      const scheduledEnableOffline = localStorage.getItem(LocalStorageKey.SCHEDULE_ENABLE_OFFLINE);
      if (scheduledEnableOffline) {
        localStorage.removeItem(LocalStorageKey.SCHEDULE_ENABLE_OFFLINE);
        toastUtils.openToastMulti({
          type: ModalTypes.INFO,
          message: 'Setting up offline...',
        });
        clickEvent.buttonClick({
          tagName: 'BUTTON',
          elementName: ButtonName.MAKE_OFFLINE_AVAILABLE_TOAST,
          elementPurpose: ButtonPurpose[ButtonName.MAKE_OFFLINE_AVAILABLE_TOAST],
        });
        storageHandler.downloadSource();
      }
    }
  };

  printAppVersionToConsole = () => {
    console.log(`%cLUMIN-PDF Version: ${process.env.VERSION}`, 'color:#ed3d48;font-family:system-ui;font-size:15px;');
  };

  estimateBrowserStorage() {
    // https://caniuse.com/?search=navigator.storage
    if (navigator?.storage?.estimate) {
      navigator.storage
        .estimate()
        .then(({ usage, quota, usageDetails }) => {
          logger.logInfo({
            message: LOGGER.EVENT.USER_USED_STORAGE,
            reason: LOGGER.Service.USED_STORAGE,
            attributes: {
              totalUsage: (usage / 1024 ** 3).toFixed(2),
              quota: (quota / 1024 ** 3).toFixed(2),
              ...(usageDetails && {
                usageDetails: {
                  caches: (usageDetails.caches / 1024 ** 3).toFixed(2),
                  indexedDB: (usageDetails.indexedDB / 1024 ** 3).toFixed(2),
                  serviceWorkerRegistrations: (usageDetails.serviceWorkerRegistrations / 1024 ** 3).toFixed(2),
                },
              }),
            },
          });
        })
        .catch((e) => {
          logger.logError({
            reason: LOGGER.Service.USED_STORAGE,
            error: e,
          });
        });
    }
  }

  render() {
    const { error, loading } = this.state;
    const {
      isLoadingModalOpen,
      themeMode,
      isAuthenticating,
      wrongIpStatus,
      membershipIsRequired,
      isEnableReskin,
      location,
      errorFromRedux,
    } = this.props;

    const isViewer = isViewerRouteMatch(location.pathname) || isTemplateViewerRouteMatch(location.pathname);
    if (loading || isAuthenticating) {
      return isViewer ? <SkeletonLoading /> : <Loading fullscreen />;
    }
    if (error || errorFromRedux) {
      return (
        <Suspense fallback={<div />}>
          <Crash error={errorFromRedux} />
        </Suspense>
      );
    }
    if (wrongIpStatus.open) {
      return (
        <Suspense fallback={<Loading fullscreen />}>
          <WrongIP email={wrongIpStatus.email} />
        </Suspense>
      );
    }
    if (membershipIsRequired.require) {
      return (
        <Suspense fallback={<Loading fullscreen />}>
          <OrganizationRestriction email={membershipIsRequired.email} />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<Loading fullscreen />}>
        <App loading={isAuthenticating}>
          <Outlet />
          <PasswordModal />
          <CookieWarningModal />
          {isLoadingModalOpen && <LoadingModal />}
          <MaterialModal />
          <NewPrivacyPolicyModal />
          <DownloadFailedModal />
          <ReactNotifications className={`ToastMulti theme-${themeMode}`} />
          {isEnableReskin ? <UploadingPopper /> : <UploadingBox />}
          <NoInternetPopup />
          <PromptToJoinTrialingOrgModal />
          <PromptToUploadLogoModalSingleton />
        </App>
      </Suspense>
    );
  }
}

Routers.propTypes = {
  location: PropTypes.object.isRequired,
  isLoadingModalOpen: PropTypes.bool,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)).isRequired,
  setOffline: PropTypes.func.isRequired,
  loadAWSPinpointSuccess: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  authenticate: PropTypes.func.isRequired,
  isAuthenticating: PropTypes.bool.isRequired,
  wrongIpStatus: PropTypes.object.isRequired,
  membershipIsRequired: PropTypes.object.isRequired,
  userLocationLoaded: PropTypes.bool.isRequired,
  isEnableReskin: PropTypes.bool,
  errorFromRedux: PropTypes.object,
};

Routers.defaultProps = {
  isLoadingModalOpen: false,
  currentUser: undefined,
  isEnableReskin: false,
};

const mapStateToProps = (state) => ({
  isLoadingModalOpen: selectors.isElementOpen(state, 'loadingModal'),
  currentUser: selectors.getCurrentUser(state),
  wrongIpStatus: selectors.getWrongIpStatus(state),
  membershipIsRequired: selectors.getMembershipOfOrg(state),
  userLocationLoaded: selectors.hasUserLocationLoaded(state),
  errorFromRedux: selectors.getError(state),
});

const mapDispatchToProps = (dispatch) => ({
  loadAWSPinpointSuccess: () => dispatch(actions.loadAWSPinpointSuccess()),
  setOffline: (status) => dispatch(actions.setOffline(status)),
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter, withEnableWebReskin)(Routers);
