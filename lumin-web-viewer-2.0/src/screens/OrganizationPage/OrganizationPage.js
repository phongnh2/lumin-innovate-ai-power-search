import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Routes, Route, Navigate, useLocation, useMatch } from 'react-router-dom';
import { compose } from 'redux';

import selectors from 'selectors';

import LoadingComponent from 'lumin-components/AppCircularLoading';

import withOrganizationTitle from 'HOC/withOrganizationTitle';
import withUpdateOrganization from 'HOC/withUpdateOrganization';
import withRemoveOrganizationMember from 'src/HOC/withRemoveOrganizationMember';
import withUpdateOrganizationMemberRole from 'src/HOC/withUpdateOrganizationMemberRole';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import organizationServices from 'services/organizationServices';

import { PaymentUtilities } from 'utils/Factory/Payment';
import { lazyWithRetry } from 'utils/lazyWithRetry';
import { addLastAccessOrg } from 'utils/orgUtils';

import useCancelSubscriptionRouteMatch from 'features/CNC/hooks/useCancelSubscriptionRouteMatch';
import { APP_NAMES, APP_URL_PATH } from 'features/MiniApps/constants';

import { ORG_TEXT, ORG_TRANSFER_URL } from 'constants/organizationConstants';
import { STATIC_PAGE_PRICING } from 'constants/Routers';
import { TEAMS_TEXT } from 'constants/teamConstant';

import * as Styled from './OrganizationPage.styled';

// const OrganizationPlanComponent = lazyWithRetry(() => import('../OrganizationPlan'), {
//   fallback: <LoadingComponent />,
// });
const OrganizationDocumentComponent = lazyWithRetry(
  () => import(/* webpackPrefetch: true */ '../OrganizationDocument'),
  {
    fallback: <LoadingComponent />,
  }
);
const OrganizationDashboardComponent = lazyWithRetry(
  () => import(/* webpackPrefetch: true */ '../OrganizationDashboard'),
  {
    fallback: <LoadingComponent />,
  }
);
const OrganizationMemberComponent = lazyWithRetry(() => import(/* webpackPrefetch: true */ '../OrganizationMember'), {
  fallback: <LoadingComponent />,
});
const OrganizationTeamListComponent = lazyWithRetry(
  () => import(/* webpackPrefetch: true */ '../OrganizationTeamList'),
  {
    fallback: <LoadingComponent />,
  }
);
const SignDocumentListComponent = lazyWithRetry(() => import('../SignDocumentList'), {
  fallback: <LoadingComponent />,
});

const AgreementGenListModule = lazyWithRetry(() => import('../AgreementGenListModule'), {
  fallback: <LoadingComponent />,
});

const WebOptModule = lazyWithRetry(() => import('../WebOptModule'), {
  fallback: <LoadingComponent />,
});

const OrganizationTeamComponent = lazyWithRetry(() => import(/* webpackPrefetch: true */ '../OrganizationTeam'), {
  fallback: <LoadingComponent />,
});

const OrganizationDocumentFolderLoadableComponent = lazyWithRetry(
  () => import(/* webpackPrefetch: true */ '../DocumentFolder'),
  {
    fallback: <LoadingComponent />,
  }
);

const TemplateListLoadableComponent = lazyWithRetry(() => import(/* webpackPrefetch: true */ '../TemplateList'), {
  fallback: <LoadingComponent />,
});

const OrganizationTransferComponent = lazyWithRetry(() => import('../OrganizationTransfer'), {
  fallback: <LoadingComponent />,
});

const SurveySubscription = lazyWithRetry(() => import('features/CNC/screens/SurveySubscription'), {
  fallback: <LoadingComponent />,
});

const CancelSubscription = lazyWithRetry(() => import('features/CNC/screens/CancelSubscription'), {
  fallback: <LoadingComponent />,
});

const FinishCancelSubscription = lazyWithRetry(() => import('features/CNC/screens/FinishCancelSubscription'), {
  fallback: <LoadingComponent />,
});

const Home = lazyWithRetry(() => import('../Home'), {
  fallback: <LoadingComponent />,
});

const XeroIntegrationApp = lazyWithRetry(() => import('features/MiniApps/XeroIntegration'), {
  fallback: <LoadingComponent />,
});

const FolderDocumentComponent = withOrganizationTitle('common.folder')(OrganizationDocumentFolderLoadableComponent);

const ROUTES = {
  DOCUMENTS: '/documents',
  TEMPLATES: '/templates',
  TEAM: `/${TEAMS_TEXT}/:id/:tab`,
  TEAMS: `/${TEAMS_TEXT}`,
  SIGN: '/sign/*',
  WEBOPT: '/webopt',
  AGREEMENT_GEN: '/generate/*',
  HOME: '/home',
  PLANS: '/plans',
  MEMBERS: '/members',
  DASHBOARD: '/dashboard',
  TRANSFER_OWNER: `/${ORG_TRANSFER_URL}`,
  SUBSCRIPTION: {
    SURVEY: `/subscription/survey`,
    CANCEL: `/subscription/cancel`,
    FINISH: `/subscription/finish`,
  },
};

const OrganizationPage = ({ layoutProps }) => {
  const location = useLocation();
  const organization = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const currentUser = useGetCurrentUser();
  const { settings, userRole, payment, url, _id } = organization.data;
  const isOrganizationManager = organizationServices.isManager(userRole);
  const paymentUtilities = new PaymentUtilities(payment);
  const shouldShowMemberPage = !settings.other.hideMember || isOrganizationManager;
  const isInSubscriptionPage = useCancelSubscriptionRouteMatch();
  const isMemberRouteMatch = Boolean(useMatch({ path: `/${ORG_TEXT}/:orgDomain/members`, end: false }));

  const BASE_URL = `/${ORG_TEXT}/${url}`;
  useEffect(() => {
    addLastAccessOrg({ id: _id, url });
  }, [_id, url]);

  const redirector = () => {
    const { pathname } = location;
    if (pathname.startsWith(BASE_URL)) {
      const page = pathname.substring(BASE_URL.length);
      const routes = Object.entries(ROUTES);
      for (let i = 0; i < routes.length; i++) {
        const [, value] = routes[i];
        if (page.includes(value) && page !== value) {
          return <Route element={<Navigate to={`${BASE_URL}${value}`} />} />;
        }
      }
    }
    return null;
  };

  if (isMemberRouteMatch) {
    return <OrganizationMemberComponent />;
  }

  return (
    <Styled.ContainerReskin $fullWidth={layoutProps.fullWidth || isInSubscriptionPage}>
      <Routes>
        <Route path={`${ROUTES.DOCUMENTS}/:type/folder/:folderId`} element={<FolderDocumentComponent />} />
        <Route path={`${ROUTES.DOCUMENTS}/:type/:teamId/folder/:folderId`} element={<FolderDocumentComponent />} />
        <Route path={`${ROUTES.DOCUMENTS}/:type/:teamId/`} element={<OrganizationDocumentComponent />} />
        <Route
          path={`${ROUTES.DOCUMENTS}/organization`}
          element={<Navigate to={`${BASE_URL}${ROUTES.DOCUMENTS}/${ORG_TEXT}`} replace />}
        />
        <Route path={`${ROUTES.DOCUMENTS}/:type`} element={<OrganizationDocumentComponent />} />
        <Route path={`${ROUTES.DOCUMENTS}`} element={<Navigate to="personal" replace />} />

        <Route path={`${ROUTES.TEMPLATES}/:type`} element={<TemplateListLoadableComponent />} />
        <Route path={`${ROUTES.TEMPLATES}/:type/:teamId`} element={<TemplateListLoadableComponent />} />
        <Route path={`${ROUTES.TEMPLATES}`} element={<Navigate to="personal" replace />} />

        <Route path={`${ROUTES.HOME}/*`} element={<Home />} />
        <Route path={`${ROUTES.HOME}`} element={<Navigate to="recent" replace />} />
        <Route path={`${ROUTES.SIGN}`} element={<SignDocumentListComponent />} basename={BASE_URL} />
        <Route path={`${ROUTES.WEBOPT}`} element={<WebOptModule />} basename={BASE_URL} />
        <Route path={`${ROUTES.AGREEMENT_GEN}`} element={<AgreementGenListModule />} basename={BASE_URL} />
        <Route path={`${ROUTES.TEAMS}`} element={<OrganizationTeamListComponent />} />
        <Route path="/teams" element={<Navigate to={`${BASE_URL}${ROUTES.TEAMS}`} replace />} />
        <Route path={`/${TEAMS_TEXT}/:id`} element={<Navigate to="insights" replace />} />
        <Route path={`${ROUTES.TEAM}`} element={<OrganizationTeamComponent />} />
        <Route path="/teams/:id/:tab" element={<OrganizationTeamComponent />} />
        {(isOrganizationManager || (organizationServices.isOrgMember(userRole) && paymentUtilities.isUnifyFree())) && (
          <Route
            path={`${ROUTES.PLANS}`}
            Component={() => {
              window.location.href = STATIC_PAGE_PRICING;
              return null;
            }}
          />
        )}
        <Route path={`${ROUTES.TRANSFER_OWNER}`} element={<OrganizationTransferComponent />} />
        <Route
          path={`${ROUTES.MEMBERS}`}
          element={
            shouldShowMemberPage ? (
              <OrganizationMemberComponent />
            ) : (
              <Navigate to={`${BASE_URL}${ROUTES.DOCUMENTS}`} replace />
            )
          }
        />
        {redirector()}
        {isOrganizationManager && <Route path={`${ROUTES.DASHBOARD}/*`} element={<OrganizationDashboardComponent />} />}
        <Route path="/" element={<Navigate to={`${BASE_URL}${ROUTES.DOCUMENTS}`} />} />
        <Route path={`${ROUTES.SUBSCRIPTION.SURVEY}`} element={<SurveySubscription />} />
        <Route path={`${ROUTES.SUBSCRIPTION.CANCEL}`} element={<CancelSubscription />} />
        <Route path={`${ROUTES.SUBSCRIPTION.FINISH}`} element={<FinishCancelSubscription />} />
        <Route
          path={`${APP_URL_PATH}/${APP_NAMES.XERO_INTEGRATION}`}
          element={<XeroIntegrationApp currentUser={currentUser} currentWorkspace={organization?.data} />}
        />

        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Styled.ContainerReskin>
  );
};

OrganizationPage.propTypes = {
  layoutProps: PropTypes.shape({
    fullWidth: PropTypes.bool.isRequired,
  }).isRequired,
};

export default compose(
  withRemoveOrganizationMember,
  withUpdateOrganizationMemberRole,
  withUpdateOrganization,
  React.memo
)(OrganizationPage);
