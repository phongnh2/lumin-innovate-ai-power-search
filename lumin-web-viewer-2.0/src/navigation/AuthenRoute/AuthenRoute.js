import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import Helmet from 'react-helmet';
import { Navigate, useMatch, useParams } from 'react-router-dom';
import { compose } from 'redux';

import AppLayout from 'layouts/AppLayout';

import { DiscoverLumin } from 'luminComponents/ReskinLayout/components/DiscoverLumin';
import { MobileScreenComponent } from 'luminComponents/ReskinLayout/components/MobileScreenComponent';

import withAuthGuard from 'HOC/withAuthGuard';
import withAuthRoute from 'HOC/withAuthRoute';
import withLayoutProps from 'HOC/withLayoutProps';
import withRouter from 'HOC/withRouter';

import {
  useDocumentsRouteMatch,
  useEnableWebReskin,
  useGetMetaTitle,
  useJoinOrgsMatch,
  useExtraSmallMatch,
  useTranslation,
  useHomeMatch,
} from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { ORG_TEXT } from 'constants/organizationConstants';
import { AuthRouteType, ROUTE_MATCH, Routers } from 'constants/Routers';
import { TEAMS_TEXT } from 'constants/teamConstant';
import { INSTALL_APP_ON_MOBILE_DOC_LIST_URL, INSTALL_APP_ON_MOBILE_HOMEPAGE_URL } from 'constants/urls';

const propTypes = {
  component: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  pageTitle: PropTypes.string.isRequired,
  condition: PropTypes.func,
  header: PropTypes.bool.isRequired,
  sidebar: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(Object.values(AuthRouteType)).isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  title: PropTypes.string,
  path: PropTypes.string.isRequired,
};

const defaultProps = {
  condition: () => true,
  title: null,
};
function AuthenRoute(props) {
  const { location, match, component: Component, pageTitle, condition, ...rest } = props;
  const { t } = useTranslation();
  const { getMetaTitle } = useGetMetaTitle();
  const routeParams = useParams();

  const { isEnableReskin } = useEnableWebReskin();
  const isMobileMatch = useExtraSmallMatch();

  const { isViewer } = useViewerMatch();
  const { isJoinOrgsPage } = useJoinOrgsMatch();
  const isPaymentPage = Boolean(useMatch({ path: Routers.PAYMENT, end: false }));
  const isDocumentRouteMatch = useDocumentsRouteMatch();
  const isTeamRouteMatch = Boolean(useMatch({ path: `/${ORG_TEXT}/:orgDomain/${TEAMS_TEXT}`, end: false }));
  const isMemberRouteMatch = Boolean(useMatch({ path: `/${ORG_TEXT}/:orgDomain/members`, end: false }));
  const isOneDriveAuthorizationRouteMatch = Boolean(
    useMatch({ path: Routers.ONE_DRIVE_ADD_INS_AUTHORIZATION, end: false })
  );
  const isCancellationPage = Boolean(useMatch({ path: ROUTE_MATCH.SUBSCRIPTION, end: false }));
  const { isHomePage: isHomePageMatch } = useHomeMatch();

  const getDeepLinkInstallAppUrl = useCallback(() => {
    if (!isDocumentRouteMatch && !isHomePageMatch) {
      return '';
    }
    return isHomePageMatch ? INSTALL_APP_ON_MOBILE_HOMEPAGE_URL : INSTALL_APP_ON_MOBILE_DOC_LIST_URL;
  }, [isDocumentRouteMatch, isHomePageMatch]);

  if (typeof condition === 'function' && !condition({ location, match })) {
    return <Navigate to="/notFound" />;
  }

  const { header, sidebar, title, fullWidth, applyReskin } = rest;
  const layoutPropsMembersPage = isEnableReskin && isMemberRouteMatch
    ? {
        sidebar: false,
        header: false,
        fullWidth: true,
      }
    : {};
  const layoutProps = {
    header,
    sidebar,
    applyReskin,
    fullWidth: isEnableReskin && applyReskin ? true : fullWidth,
    ...layoutPropsMembersPage,
  };
  const metaTitle = pageTitle ? t(pageTitle) : '';

  const renderApp = () => {
    const isRootRoute = rest.path === '/';
    // TODO: remove checking isTeamRouteMatch when these route are reskined
    const ignoredRoute = isRootRoute || isTeamRouteMatch;
    if (isEnableReskin && isMobileMatch && applyReskin && !ignoredRoute) {
      const installAppUrl = getDeepLinkInstallAppUrl();
      if (installAppUrl) {
        return <MobileScreenComponent installAppUrl={installAppUrl} />;
      }
      const isRouteSupportMobileScreen =
        isViewer || isPaymentPage || isJoinOrgsPage || isOneDriveAuthorizationRouteMatch || isCancellationPage;
      if (!isRouteSupportMobileScreen) {
        return <DiscoverLumin />;
      }
    }

    return (
      <AppLayout {...layoutProps} title={title}>
        <Component location={location} routeParams={routeParams} layoutProps={layoutProps} />
      </AppLayout>
    );
  };

  return (
    <>
      <Helmet>
        <title>{getMetaTitle(metaTitle)}</title>
      </Helmet>
      {renderApp()}
    </>
  );
}

AuthenRoute.propTypes = propTypes;
AuthenRoute.defaultProps = defaultProps;

// ! ATTENTION: Don't change the order of those high-order components.
// Please adding another HOC at the end of compose.
export default compose(withAuthGuard, withAuthRoute, withLayoutProps, withRouter)(AuthenRoute);
