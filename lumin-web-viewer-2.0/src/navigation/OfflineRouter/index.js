import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import actions from 'actions';
import selectors from 'selectors';

import GrowthBookProvider from 'lumin-components/GrowthBookProvider';

import { useThemeMode, useThemeProvider } from 'hooks';
import { useInstallPwaListener } from 'hooks/useInstallPwaListener';

import OfflineRouters from './OfflineRouter';
import { RouterContext } from '../Router/RouterContext';

const OfflineRoutersContainer = (props) => {
  const { hasInstalled: hasInstalledPwa, install: installPwa } = useInstallPwaListener();
  const themeMode = useThemeMode();
  const theme = useThemeProvider();
  const contextValue = useMemo(
    () => ({
      installPwa,
      hasInstalledPwa,
    }),
    [installPwa, hasInstalledPwa]
  );

  return (
    <RouterContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <GrowthBookProvider>
          <OfflineRouters {...props} themeMode={themeMode} />
        </GrowthBookProvider>
      </ThemeProvider>
    </RouterContext.Provider>
  );
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  setCurrentUser: (currentUser) => dispatch(actions.setCurrentUser(currentUser)),
  setOffline: (isOffline) => dispatch(actions.setOffline(isOffline)),
  setCurrentOrganization: (setCurrentOrganization) => dispatch(actions.setCurrentOrganization(setCurrentOrganization)),
  setIsAuthenticating: (isAuthenticating) => dispatch(actions.setIsAuthenticating(isAuthenticating)),
  setIsCompletedGettingUserData: (isCompleted) => dispatch(actions.setIsCompletedGettingUserData(isCompleted)),
  openModal: (modalSetting) => dispatch(actions.openModal(modalSetting)),
  closeModal: () => dispatch(actions.closeModal()),
});

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  isLoadingModalOpen: selectors.isElementOpen(state, 'loadingModal'),
});
export default connect(mapStateToProps, mapDispatchToProps)(OfflineRoutersContainer);
