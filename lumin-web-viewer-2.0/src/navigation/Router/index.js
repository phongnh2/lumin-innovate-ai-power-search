import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import actions from 'actions';
import selectors from 'selectors';

import GrowthBookProvider from 'lumin-components/GrowthBookProvider';

import useDocStackListener from 'hooks/useDocStackListener';
import useInitOneDriveLoader from 'hooks/useInitOneDriveLoader';
import { useInstallPwaListener } from 'hooks/useInstallPwaListener';
import { useLoadTrackingScript } from 'hooks/useLoadTrackingScript';
import { useOnSwitchTheme } from 'hooks/useOnSwitchTheme';
import { useThemeMode } from 'hooks/useThemeMode';
import { useThemeProvider } from 'hooks/useThemeProvider';

import useUpdateSkipTrialModalStorage from 'features/CNC/hooks/useUpdateSkipTrialModalStorage';
import { cookieConsents } from 'features/cookieConsents/cookieConsents';

import useCleanSourceCache from './hooks/useCleanSourceCache';
import { useDetectIncognito } from './hooks/useDetectIncognito';
import { RouterContext } from './RouterContext';
import RouterContextProvider from './RouterContextProvider';
import { gapiLoader } from './setupGoogleClient';

const RouterContainer = (props) => {
  const { currentUser, eventTrackingQueue, resetEventTrackingQueue, isLoadingOrganizationList } = props;
  const themeMode = useThemeMode();
  const theme = useThemeProvider();
  const [cookieData, setCookieData] = useState({
    cookieWarning: false,
    cookiesDisabled: false,
  });
  const { _id: userId } = currentUser || {};
  const { hubspotLoaded } = useLoadTrackingScript();
  const {
    hasInstalled: hasInstalledPwa,
    install: installPwa,
    detecting: detectingPwaInstalled,
  } = useInstallPwaListener();

  useDocStackListener();

  useCleanSourceCache();

  useDetectIncognito();

  useUpdateSkipTrialModalStorage();

  useInitOneDriveLoader();

  useOnSwitchTheme();

  useEffect(() => {
    gapiLoader.load();
    cookieConsents.load();
  }, []);

  useEffect(() => {
    const setupHubspot = () => {
      if (!currentUser || !hubspotLoaded) {
        return;
      }
      import('services/hubspotServices').then(({ default: hubspotServices }) => {
        hubspotServices.identity(currentUser.email);
        hubspotServices.refreshWidgetWithTimeout();
      });
    };

    setupHubspot();
  }, [hubspotLoaded, currentUser]);

  useEffect(() => {
    if (userId && !isLoadingOrganizationList) {
      const eventTrackingQueueClone = cloneDeep(eventTrackingQueue);
      eventTrackingQueueClone.map((item) => item());
      resetEventTrackingQueue();
    }
  }, [userId, isLoadingOrganizationList]);

  const routerContext = useMemo(
    () => ({ installPwa, hasInstalledPwa, detectingPwaInstalled }),
    [installPwa, hasInstalledPwa, detectingPwaInstalled]
  );

  return (
    <RouterContext.Provider value={routerContext}>
      <ThemeProvider theme={theme}>
        <GrowthBookProvider>
          <RouterContextProvider cookieData={cookieData} setCookieData={setCookieData} themeMode={themeMode} />
        </GrowthBookProvider>
      </ThemeProvider>
    </RouterContext.Provider>
  );
};

RouterContainer.propTypes = {
  currentUser: PropTypes.object,
  eventTrackingQueue: PropTypes.any,
  resetEventTrackingQueue: PropTypes.func,
  isLoadingOrganizationList: PropTypes.bool,
};

RouterContainer.defaultProps = {
  currentUser: null,
  eventTrackingQueue: [],
  resetEventTrackingQueue: () => {},
  isLoadingOrganizationList: false,
};

const mapDispatchToProps = (dispatch) => ({
  resetEventTrackingQueue: () => dispatch(actions.resetEventTrackingQueue()),
});
const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  eventTrackingQueue: selectors.getEventTrackingQueue(state),
  isLoadingOrganizationList: selectors.isLoadingOrganizationList(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(RouterContainer);
