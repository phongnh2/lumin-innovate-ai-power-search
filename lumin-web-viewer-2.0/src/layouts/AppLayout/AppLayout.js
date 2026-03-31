import classNames from 'classnames';
import { ScrollArea } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, Fragment } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useLocation, useMatch } from 'react-router';
import { compose } from 'redux';

import selectors from 'selectors';

import LeftSidebar from 'luminComponents/LeftSidebar';
import NavigationBar from 'luminComponents/NavigationBar';
import { OrgMainSidebar, PersonalMainSidebar } from 'luminComponents/ReskinLayout/components';
import { LeftSubSidebar } from 'luminComponents/ReskinLayout/components/LeftSubSidebar';
import { RightSideBar } from 'luminComponents/RightSideBar';
import WarningBanner from 'luminComponents/WarningBanner';

import withDocumentTemplateRestricted from 'HOC/withDocumentTemplateRestricted';
import withForceReloadVersion from 'HOC/withForceReloadVersion/withForceReloadVersion';
import withMyDocumentGuide from 'HOC/withMyDocumentGuide/withMyDocumentGuide';
import withRemoveUserAccount from 'HOC/withRemoveUserAccount';
import withWarningBanner from 'HOC/withWarningBanner';

import { useMobileMatch } from 'hooks';
import useAgreementListModuleMatch from 'hooks/useAgreementListModuleMatch';
import { useDesktopMatch } from 'hooks/useDesktopMatch';
import { useEnableWebReskin } from 'hooks/useEnableWebReskin';
import useHomeMatch from 'hooks/useHomeMatch';
import useSignDocListMatch from 'hooks/useSignDocListMatch';
import { useTabletMatch } from 'hooks/useTabletMatch';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';
import useTrackingOidcAuth from 'hooks/useTrackingOidcAuth';
import { useWindowSize } from 'hooks/useWindowSize';

import { matchPaths } from 'helpers/matchPaths';

import { isElectron } from 'utils/corePathHelper';
import { RouterUtil } from 'utils/routerUtil';

import useCancelSubscriptionRouteMatch from 'features/CNC/hooks/useCancelSubscriptionRouteMatch';
import WebRightPanel from 'features/WebRightPanel';

import { ORGANIZATION_ROUTERS } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';

import { AppLayoutContext } from './AppLayoutContext';
import ChildrenWrapper from './ChildrenWrapper';

import * as Styled from './AppLayout.styled';

import styles from './AppLayout.module.scss';

const propTypes = {
  sidebar: PropTypes.bool.isRequired,
  header: PropTypes.bool.isRequired,
  applyReskin: PropTypes.bool,
  fullWidth: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};
const defaultProps = {
  title: null,
  applyReskin: false,
};
function AppLayout({ sidebar, header, children, title, applyReskin, fullWidth }) {
  const isDesktopMatch = useDesktopMatch();
  const location = useLocation();
  const isTablet = useTabletMatch();
  const isMobile = useMobileMatch();
  const { height } = useWindowSize();
  const bodyScrollRef = useRef(null);
  const isOffline = useSelector(selectors.isOffline);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { isTemplatesPage } = useTemplatesPageMatch();
  const isInDocumentPage = RouterUtil.isDocumentPath(location.pathname);
  const dashboardRouteMatch = Boolean(useMatch({ path: ROUTE_MATCH.DASHBOARD_ROOT, end: false }));
  const { isInSignDocListPage } = useSignDocListMatch();
  const isInSubscriptionPage = useCancelSubscriptionRouteMatch();
  const isInXeroIntegrationPage = Boolean(useMatch({ path: ROUTE_MATCH.XERO_INTEGRATION, end: false }));
  const { isInAgreementListModulePage } = useAgreementListModuleMatch();

  const orgRouteMatch = matchPaths(
    ORGANIZATION_ROUTERS.map((path) => ({ path, end: false })),
    location.pathname
  );

  const { isHomePage } = useHomeMatch();
  const { isEnableReskin } = useEnableWebReskin();

  const isShowRightSidebar = isInDocumentPage && sidebar && !isMobile;

  const ReskinComponents =
    (isEnableReskin || isInSubscriptionPage) && applyReskin
      ? {
          ChildrenContainer: Styled.ChildrenContainerReskin,
          ChildrenContentWrapper: Styled.ChildrenContentWrapperReskin,
          ContentContainer: Styled.ContentContainerReskin,
        }
      : {
          ChildrenContainer: Styled.ChildrenContainer,
          ChildrenContentWrapper: Fragment,
          ContentContainer: Styled.ContentContainer,
        };

  useEffect(() => {
    if (!isTablet && window.innerHeight > 0) {
      // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
      // eslint-disable-next-line no-magic-numbers
      const vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  }, [isTablet, height]);

  useTrackingOidcAuth({ currentUser });

  const renderSidebar = () => {
    if (isEnableReskin) {
      return (
        <Styled.SidebarReskin $offline={isOffline}>
          <ScrollArea classNames={{ root: styles.scrollArea, viewport: styles.scrollViewport }} scrollbars="y">
            {orgRouteMatch ? <OrgMainSidebar /> : <PersonalMainSidebar />}
          </ScrollArea>
        </Styled.SidebarReskin>
      );
    }
    return (
      <Styled.LeftSidebar>
        <LeftSidebar />
      </Styled.LeftSidebar>
    );
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <AppLayoutContext.Provider value={{ bodyScrollRef }}>
      <Styled.Container data-is-electron={isElectron()}>
        {!isInSubscriptionPage && (
          <WarningBanner wrapper={isEnableReskin ? Styled.WarningReskin : Styled.Warning}>
            {({ element }) => element}
          </WarningBanner>
        )}
        <Styled.MainPage>
          {isDesktopMatch && sidebar && !isInSubscriptionPage && renderSidebar()}

          <ReskinComponents.ContentContainer $sidebar={sidebar && !isInSubscriptionPage}>
            {header && !isInSubscriptionPage && <NavigationBar title={title} />}
            <Styled.ContentWrapper className={classNames({ [styles.contentWrapperFlex]: isShowRightSidebar })}>
              <ReskinComponents.ChildrenContentWrapper
                $sidebar={sidebar}
                $fullScreen={isInSubscriptionPage}
                $isHomePage={isHomePage}
                $isInAgreementModulePage={isInAgreementListModulePage}
                $isInDocumentPage={isInDocumentPage}
                $isInXeroIntegrationPage={isInXeroIntegrationPage}
              >
                {sidebar && isEnableReskin && <LeftSubSidebar />}
                <ChildrenWrapper
                  isEnableReskin={(isInSubscriptionPage || isEnableReskin) && applyReskin}
                  sidebar={sidebar}
                  bodyScrollRef={bodyScrollRef}
                  isOffline={isOffline}
                  isInDocumentPage={isInDocumentPage || isTemplatesPage}
                >
                  <ReskinComponents.ChildrenContainer
                    ref={isEnableReskin && dashboardRouteMatch ? bodyScrollRef : undefined}
                    $fullWidth={fullWidth || isInSubscriptionPage}
                    $sidebar={sidebar && !isHomePage && !isInSubscriptionPage}
                    $isHomePage={isHomePage}
                    $isInDocList={isInDocumentPage || isTemplatesPage}
                    $isInSignDocListPage={isInSignDocListPage}
                    $reskinScrollbar={dashboardRouteMatch}
                    $isInAgreementModulePage={isInAgreementListModulePage}
                    data-joyride-new-in-app-layout="step-3"
                  >
                    {children}
                  </ReskinComponents.ChildrenContainer>
                </ChildrenWrapper>
                <WebRightPanel />
              </ReskinComponents.ChildrenContentWrapper>
              {isShowRightSidebar && (
                <Styled.RightSidebar>
                  <RightSideBar />
                </Styled.RightSidebar>
              )}
            </Styled.ContentWrapper>
          </ReskinComponents.ContentContainer>
        </Styled.MainPage>
      </Styled.Container>
    </AppLayoutContext.Provider>
  );
}

AppLayout.propTypes = propTypes;
AppLayout.defaultProps = defaultProps;

export default compose(
  withWarningBanner,
  withRemoveUserAccount,
  withMyDocumentGuide,
  withForceReloadVersion,
  withDocumentTemplateRestricted,
  React.memo
)(AppLayout);
