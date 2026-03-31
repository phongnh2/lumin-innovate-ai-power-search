import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { ReactNotifications } from 'react-notifications-component';
import { batch } from 'react-redux';
import { Outlet, matchPath } from 'react-router';

import Crash from 'luminComponents/Crash';
import Loading from 'luminComponents/Loading';
import LoadingModal from 'luminComponents/LoadingModal';
import MaterialModal from 'luminComponents/MaterialModal';
import PasswordModal from 'luminComponents/PasswordModal';

import { cachingFileHandler } from 'HOC/OfflineStorageHOC';
import withRouter from 'HOC/withRouter';

import { indexedDBService } from 'services';

import { swPath } from 'helpers/pwa';

import { isNetworkValid } from 'utils';

import DownloadFailedModal from 'features/MultipleDownLoad/components/DownloadFailedModal';

import { ModalTypes, CHECK_ONINE_DELAY_TIME, CHECK_ONLINE_POLLING_TIME } from 'constants/lumin-common';

import { socket } from '../../socket';

class OfflineRouters extends React.Component {
  state = {
    error: false,
    loading: true,
  };

  async componentDidMount() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(swPath);
    }
    await indexedDBService.openDb();
    indexedDBService.getOfflineInfo().then(({ user, organizations, organization, document_list }) => {
      this.onOffline();
      if (!process.env.DEBUG_OFFLINE_MODE) {
        socket.registerOnlineHandler(this.onOnline);
      }
      batch(async () => {
        this.props.setOffline(true);
        this.props.setCurrentUser({
          ...user,
          lastDocumentListUrl: document_list.lastUrl,
        });
        this.props.setCurrentOrganization(organization.data);
        this.props.dispatch({
          type: 'FETCH_ORGANIZATIONS_SUCCESS',
          payload: {
            organizations,
          },
        });
        this.props.setIsCompletedGettingUserData(true);
        this.props.setIsAuthenticating(false);
      });
    });
    this.printAppVersionToConsole();
  }

  async componentDidUpdate(prevProps) {
    // eslint-disable-next-line react/prop-types
    if (!prevProps.currentUser && this.props.currentUser) {
      // eslint-disable-next-line react/prop-types
      await cachingFileHandler.initialize(this.props.currentUser);
      this.setState({
        loading: false,
      });
    }
  }

  componentDidCatch() {
    this.setState({
      error: true,
    });
  }

  componentWillUnmount() {
    cachingFileHandler.uninitialize();
  }

  onOffline = () => {
    clearTimeout(this.startIntervalCheckingRef);
    clearInterval(this.networkIntervalChecking);
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
    const { location } = this.props;
    clearTimeout(this.startIntervalCheckingRef);
    clearInterval(this.networkIntervalChecking);
    const match = matchPath(
      {
        path: '/viewer/:documentId',
        end: false,
      },
      location.pathname
    );
    if (!match) {
      const modalData = {
        title: 'Reload to up-to-date',
        message: 'You go online again. Please reload to have the latest version.',
        type: ModalTypes.WARNING,
        isFullWidthButton: true,
        confirmButtonTitle: 'Reload',
        onConfirm: () => window.location.reload(),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      };
      this.props.openModal(modalData);
    } else {
      this.props.setOffline(false);
    }
  };

  // eslint-disable-next-line class-methods-use-this
  printAppVersionToConsole = () => {
    console.log(`%cLUMIN-PDF Version: ${process.env.VERSION}`, 'color:#ed3d48;font-family:system-ui;font-size:15px;');
  };

  render() {
    const { error, loading } = this.state;
    const { themeMode } = this.props;
    if (error) {
      return (
        <Suspense fallback={<Loading fullscreen />}>
          <Crash />
        </Suspense>
      );
    }

    return loading ? (
      <Loading fullscreen />
    ) : (
      <>
        <Helmet>
          <meta property="og:image" content={`${window.location.origin}/assets/images/logo.png`} />
        </Helmet>
        <Suspense fallback={<div />}>
          <Outlet />
          <LoadingModal />
          <MaterialModal />
          <PasswordModal />
          <DownloadFailedModal />
          <ReactNotifications className={`ToastMulti theme-${themeMode}`} />
        </Suspense>
      </>
    );
  }
}

OfflineRouters.propTypes = {
  setCurrentUser: PropTypes.func,
  setCurrentOrganization: PropTypes.func,
  setIsAuthenticating: PropTypes.func,
  dispatch: PropTypes.func,
  setOffline: PropTypes.func,
  openModal: PropTypes.func,
  themeMode: PropTypes.string.isRequired,
  setIsCompletedGettingUserData: PropTypes.func,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
};

OfflineRouters.defaultProps = {
  setCurrentUser: () => {},
  setCurrentOrganization: () => {},
  setIsAuthenticating: () => {},
  setIsCompletedGettingUserData: () => {},
  dispatch: () => {},
  setOffline: () => {},
  openModal: () => {},
};

export default withRouter(OfflineRouters);
