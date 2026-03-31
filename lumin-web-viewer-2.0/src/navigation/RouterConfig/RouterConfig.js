/* eslint-disable react/prop-types */
import { createRemoteAppComponent } from '@module-federation/bridge-react';
import React from 'react';
import { Navigate } from 'react-router';

import LoadingComponent from 'lumin-components/AppCircularLoading';
import Loading from 'luminComponents/Loading';

import { loadRemote } from 'services/moduleFederation';

import { lazyWithRetry } from 'utils/lazyWithRetry';
import { PaymentHelpers } from 'utils/payment';

import { DocumentFolderTypeTab } from 'constants/documentFolderTypeTab';
import { ORG_PATH, ORG_TEXT } from 'constants/organizationConstants';
import { PERIOD, PLAN_URL } from 'constants/plan';
import { Routers, ROUTE_MATCH, NEW_AUTH_FLOW_ROUTE, STATIC_PAGE_PRICING } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { getNewPaymentRedirector } from './shared/getNewPaymentRedirector';
import { getOldPaymentRedirector } from './shared/getOldPaymentRedirector';
import { getUnifyNewPaymentRedirector } from './shared/getUnifyPaymentRedirector';

export const LOADABLE_TIMEOUT = 120000;

const OLD_ORG_PAYMENT_PATH = '/payment/organization/:period?';

const RootRouteLoadableComponent = lazyWithRetry(() => import('../RootRoute'), {
  fallback: <LoadingComponent />,
});

const OpenDropboxLoadableComponent = lazyWithRetry(() => import('../../screens/OpenDropbox'), {
  fallback: <LoadingComponent />,
});

const DocumentLoadableComponent = lazyWithRetry(() => import('../../screens/PersonalDocument'), {
  fallback: <LoadingComponent />,
});

// const PlanLoadableComponent = lazyWithRetry(() => import('../../screens/Plan'), {
//   fallback: <LoadingComponent />,
// });

const AuthenContainerLoadableComponent = lazyWithRetry(() => import('../../screens/AuthenContainer'), {
  fallback: <LoadingComponent />,
});

const ViewerLoadableComponent = lazyWithRetry(() => import('../../screens/Viewer'), {
  fallback: <Loading fullscreen />,
});

const NotFoundLoadableComponent = lazyWithRetry(() => import('../../screens/NotFound'), {
  fallback: <LoadingComponent />,
});

const OpenFormLoadableComponent = lazyWithRetry(() => import('../../screens/OpenForm'), {
  fallback: <LoadingComponent />,
});

const CreateExternalPdfLoadableComponent = lazyWithRetry(() => import('../../screens/CreateExternalPdf'), {
  fallback: <LoadingComponent />,
});

const RequestSubmittedComponent = lazyWithRetry(() => import('../../screens/RequestSubmittedPage'), {
  fallback: <LoadingComponent />,
});

const RequestAccessComponent = lazyWithRetry(() => import('../../screens/RequestAccess'), {
  fallback: <LoadingComponent />,
});

const AuthorizeRequestComponent = lazyWithRetry(() => import('../../screens/AuthorizeRequest'), {
  fallback: <LoadingComponent />,
});

const PersonalDashboardLoadableComponent = lazyWithRetry(() => import('../../screens/PersonalDashboard'), {
  fallback: <LoadingComponent />,
});

const OrganizationContainer = lazyWithRetry(() => import('../../screens/OrganizationContainer'), {
  fallback: <LoadingComponent />,
});

const OrganizationCreateLoadableComponent = lazyWithRetry(() => import('../../screens/OrganizationCreate'), {
  fallback: <LoadingComponent />,
});

const OrganizationListLoadableComponent = lazyWithRetry(() => import('../../screens/OrganizationList'), {
  fallback: <LoadingComponent />,
});

const TeamConvertPage = lazyWithRetry(() => import('../../screens/TeamConvertPage'), {
  fallback: <LoadingComponent />,
});

const RedirectionLoadableComponent = lazyWithRetry(() => import('../../screens/Redirection'), {
  fallback: <LoadingComponent />,
});

const DocumentFolderLoadableComponent = lazyWithRetry(() => import('../../screens/PersonalDocumentFolder'), {
  fallback: <LoadingComponent />,
});

const OrgFreeTrialLoadableComponent = lazyWithRetry(() => import('../../screens/OrganizationFreeTrialPage'));

const DownloadLoadableComponent = lazyWithRetry(() => import('../../screens/Download'), {
  fallback: <LoadingComponent />,
});

// const TemplatesLoadableComponent = lazyWithRetry(() => import('../../screens/Templates'), {
//   fallback: <LoadingComponent />,
// });

const MobileAppRedirectionLoadable = lazyWithRetry(() => import('../../screens/MobileAppRedirection'), {
  fallback: <LoadingComponent />,
});

const JoinCircle = lazyWithRetry(() => import('../../screens/JoinOrganization'), {
  fallback: <LoadingComponent />,
});

const SubmitRequestSuccessfully = lazyWithRetry(() => import('../../screens/SubmitRequestSuccessfully'), {
  fallback: <LoadingComponent />,
});

const SetUpOrganization = lazyWithRetry(() => import('../../screens/SetUpOrganization'), {
  fallback: <LoadingComponent />,
});

const InviteLinkVerification = lazyWithRetry(() => import('screens/InviteLinkVerification'), {
  fallback: <LoadingComponent />,
});

const OpenLuminLoadable = lazyWithRetry(() => import('../../screens/OpenLumin'), {
  fallback: <LoadingComponent />,
});

const VerifyDropboxFormLoadable = lazyWithRetry(() => import('luminComponents/VerifyDropboxForm'), {
  fallback: <LoadingComponent />,
});

const WrongAccountLoadable = lazyWithRetry(() => import('../../screens/WrongAccount'), {
  fallback: <LoadingComponent />,
});

const TechnicalIssueLoadable = lazyWithRetry(() => import('../../screens/TechnicalIssue'), {
  fallback: <LoadingComponent />,
});

const OneDriveAddInsAuthorizationPage = lazyWithRetry(() => import('screens/OneDriveAddInsAuthorizationPage'), {
  fallback: <LoadingComponent />,
});

const JoinOrganizationFromOpenDrive = lazyWithRetry(
  () => import('features/CNC/CncComponents/JoinOrganizationFromOpenDrive'),
  {
    fallback: <LoadingComponent />,
  }
);

const OAuthDropboxComponent = createRemoteAppComponent({
  loader: () => loadRemote('luminsign/OAuthDropbox'),
  loading: <LoadingComponent />,
});

const SignDocumentListLoadableComponent = lazyWithRetry(() => import('../../screens/SignDocumentList'), {
  fallback: <LoadingComponent />,
});

const WebOptModuleLoadableComponent = lazyWithRetry(() => import('../../screens/WebOptModule'), {
  fallback: <LoadingComponent />,
});

const JoinOrganizations = lazyWithRetry(() => import('screens/JoinOrganizations'), {
  fallback: <LoadingComponent />,
});

const SettingsLoadable = lazyWithRetry(() => import('screens/Settings'), {
  fallback: <LoadingComponent />,
});

const InviteCollaborators = lazyWithRetry(() => import('features/CNC/CncComponents/InviteCollaborators'), {
  fallback: <LoadingComponent />,
});

const CheckoutPageLoadableComponent = lazyWithRetry(() => import('features/CNC/screens/OrganizationCheckoutPage'));

const oldCreateOrgPaths = ['/organization/create', '/circle/create'].map((path) => ({
  path,
  component: () => <Navigate to={Routers.ORGANIZATION_CREATE} replace />,
  auth: true,
  pageTitle: 'pageTitle.createOrg',
  header: false,
  sidebar: false,
  fullWidth: true,
  applyReskin: true,
}));

const oldOrgPaths = ['/org/:orgName/*', '/circle/:orgName/*'].map((path) => ({
  path,
  component: ({ location, routeParams }) => {
    const { orgName, '*': splat } = routeParams;
    const newPath = `/${ORG_TEXT}/${orgName}/${splat}${location.search}`;
    return <Navigate to={newPath} replace />;
  },
  auth: true,
  organization: true,
  applyReskin: true,
  pageTitle: 'common.circle',
}));

const oldOrgListPaths = ['/organizations', '/circles'].map((path) => ({
  path,
  component: () => <Navigate to={`/${ORG_TEXT}s`} replace />,
  auth: true,
  pageTitle: 'pageTitle.orgList',
  sidebar: false,
  header: false,
  fullWidth: true,
  applyReskin: true,
}));

const joinYourOrgPageTitle = 'pageTitle.joinYourOrg';

const routes = [
  {
    path: '/',
    component: RootRouteLoadableComponent,
    auth: true,
    applyReskin: true,
    pageTitle: 'pageTitle.rootRoute',
  },
  // {
  //   path: '/open/google/',
  //   component: OpenDriveLoadableComponent,
  //   auth: false,
  //   pageTitle: 'pageTitle.openDrive',
  // },
  {
    path: '/open/dropbox/',
    component: OpenDropboxLoadableComponent,
    auth: true,
    pageTitle: 'pageTitle.openDropbox',
  },
  {
    path: '/authentication/verify-dropbox',
    component: VerifyDropboxFormLoadable,
    sidebar: false,
    header: false,
    pageTitle: 'pageTitle.verifyDropbox',
  },
  {
    path: ROUTE_MATCH.VIEWER_TEMP_EDIT,
    component: ViewerLoadableComponent,
    auth: false,
    noIndex: true,
  },
  {
    path: ROUTE_MATCH.VIEWER_TEMP_EDIT_EXTERNAL_PDF,
    component: ViewerLoadableComponent,
    auth: false,
    noIndex: true,
  },
  {
    path: '/viewer/mobile/:documentId',
    component: MobileAppRedirectionLoadable,
    auth: false,
    sidebar: false,
    header: true,
    fullWidth: true,
    pageTitle: 'pageTitle.mobileAppRedirect',
  },
  {
    path: '/viewer/guest/:documentId',
    component: ViewerLoadableComponent,
    exact: true,
    auth: false,
  },
  {
    path: '/viewer/:documentId',
    component: ViewerLoadableComponent,
    auth: false,
    noIndex: true,
  },
  {
    path: ROUTE_MATCH.TEMPLATE_VIEWER,
    component: ViewerLoadableComponent,
    auth: false,
    noIndex: true,
  },
  {
    path: '/documents/:type',
    component: DocumentLoadableComponent,
    auth: true,
    applyReskin: true,
    condition: ({ match }) => {
      const { type } = match.params;
      const personalWorkspaceDocs = [
        DocumentFolderTypeTab.PERSONAL,
        DocumentFolderTypeTab.SHARED,
        DocumentFolderTypeTab.STARRED,
      ];
      return personalWorkspaceDocs.includes(type.toLowerCase());
    },
  },
  {
    path: '/documents',
    component: () => <Navigate to={`/documents/${DocumentFolderTypeTab.PERSONAL}`} />,
    auth: true,
    applyReskin: true,
    pageTitle: 'pageTitle.personalMyDocuments',
  },
  {
    path: ROUTE_MATCH.PREMIUM_USER_PATHS.FOLDER_DOCUMENTS,
    component: DocumentFolderLoadableComponent,
    auth: true,
    applyReskin: true,
    pageTitle: 'pageTitle.personalMyDocuments',
  },
  {
    path: ROUTE_MATCH.PREMIUM_USER_PATHS.SIGN_DOC_LIST,
    component: SignDocumentListLoadableComponent,
    auth: true,
    applyReskin: true,
    pageTitle: 'pageTitle.sign',
  },
  {
    path: ROUTE_MATCH.PREMIUM_USER_PATHS.WEBOPT_MODULE,
    component: WebOptModuleLoadableComponent,
    auth: true,
    applyReskin: true,
    pageTitle: 'Web Optimization',
  },
  {
    path: Routers.SETTINGS.ROOT,
    component: () => <Navigate to={Routers.SETTINGS.GENERAL} replace />,
    auth: true,
    sidebar: false,
    header: false,
    fullWidth: true,
  },
  {
    path: `${Routers.SETTINGS.ROOT}/:type`,
    component: SettingsLoadable,
    auth: true,
    sidebar: false,
    header: false,
    fullWidth: true,
  },
  {
    path: '/setting',
    component: () => <Navigate to={Routers.SETTINGS.GENERAL} replace />,
    auth: true,
  },
  {
    path: '/setting/:type',
    component: () => <Navigate to={Routers.SETTINGS.GENERAL} replace />,
    auth: true,
  },
  {
    path: '/payment/free-trial/:planName?/:period?',
    component: OrgFreeTrialLoadableComponent,
    auth: true,
    sidebar: false,
    header: false,
    fullWidth: true,
    pageTitle: 'pageTitle.freeTrial',
    applyReskin: true,
    condition: ({ match }) => {
      const { planName, period } = match.params;
      const [plan] = Object.entries(PLAN_URL).find(([_, value]) => value === planName) || [];
      const isValidPlan = PaymentHelpers.isDocStackPlan(plan);
      const isValidPeriod = Boolean(period && Object.values(PERIOD).includes(period.toUpperCase()));

      return !planName || (isValidPlan && isValidPeriod);
    },
  },
  {
    /**
     * redirect for old payment url (`organization` wording)
     */
    path: '/payment/organization',
    component: ({ location }) => getOldPaymentRedirector({ location, targetKey: 'organization' }),
  },
  {
    /**
     * redirect for old payment url (`organization` wording)
     */
    path: OLD_ORG_PAYMENT_PATH,
    component: ({ location }) => getOldPaymentRedirector({ location, targetKey: 'organization' }),
  },
  {
    /**
     * redirect for old payment url (`circle` wording)
     */
    path: '/payment/circle/:period?',
    component: (input) => getOldPaymentRedirector({ location: input.location, targetKey: 'circle' }),
  },
  {
    path: '/payment/workspace/:period?',
    component: (input) => getOldPaymentRedirector({ location: input.location, targetKey: 'workspace' }),
  },
  {
    path: ROUTE_MATCH.PAYMENT,
    component: (props) => getNewPaymentRedirector(props),
    header: false,
    sidebar: false,
    fullWidth: true,
    auth: true,
    applyReskin: true,
    pageTitle: 'payment.title',
  },
  {
    path: Routers.PAYMENT,
    component: (props) => getUnifyNewPaymentRedirector(props),
    header: false,
    sidebar: false,
    fullWidth: true,
    auth: true,
    applyReskin: true,
    pageTitle: 'payment.title',
  },
  {
    path: '/plans',
    component: () => {
      window.location.href = STATIC_PAGE_PRICING;
      return null;
    },
    auth: true,
    sidebar: false,
    fullWidth: true,
    header: false,
  },
  {
    path: '/authentication/*',
    component: AuthenContainerLoadableComponent,
    guestOnly: true,
  },
  {
    path: '/verify-account',
    component: <Navigate to={Routers.ROOT} />,
  },
  {
    path: '/open-form',
    component: OpenFormLoadableComponent,
    exact: false,
    auth: false,
  },
  {
    path: '/create-external-pdf',
    component: CreateExternalPdfLoadableComponent,
    exact: false,
    auth: false,
  },
  {
    path: Routers.INVITATION_MAIL,
    component: <Navigate to={Routers.ROOT} />,
    exact: true,
    auth: false,
    guestOnly: true,
  },
  {
    path: ROUTE_MATCH.INVITATION_MAIL,
    component: <Navigate to={Routers.ROOT} />,
    exact: false,
    auth: false,
  },
  {
    path: Routers.REQUEST_SUBMITTED,
    component: RequestSubmittedComponent,
    auth: true,
    pageTitle: 'pageTitle.requestSubmitted',
    sidebar: false,
    header: false,
    fullWidth: true,
  },
  {
    path: Routers.REQUEST_ACCESS_TEMPLATE,
    component: RequestAccessComponent,
    auth: true,
    pageTitle: 'pageTitle.requestAccess',
    sidebar: false,
    header: false,
    fullWidth: true,
  },
  {
    path: Routers.REQUEST_ACCESS,
    component: RequestAccessComponent,
    auth: true,
    pageTitle: 'pageTitle.requestAccess',
    sidebar: false,
    header: false,
    fullWidth: true,
  },
  {
    path: '/authorize-requested',
    component: AuthorizeRequestComponent,
    auth: false,
    pageTitle: 'pageTitle.authorizeRequested',
    sidebar: false,
    header: false,
    fullWidth: true,
  },
  {
    path: Routers.ORGANIZATION_CREATE,
    component: OrganizationCreateLoadableComponent,
    auth: true,
    pageTitle: 'pageTitle.createOrg',
    header: false,
    sidebar: false,
    fullWidth: true,
    applyReskin: true,
  },
  ...oldCreateOrgPaths,
  {
    path: ORG_PATH,
    component: OrganizationContainer,
    auth: true,
    organization: true,
    applyReskin: true,
    pageTitle: 'common.circle',
  },
  ...oldOrgPaths,
  {
    path: '/dashboard/*',
    component: PersonalDashboardLoadableComponent,
    auth: true,
    pageTitle: 'pageTitle.personalDashboard',
    title: 'common.insights',
    applyReskin: true,
  },
  {
    path: `/${ORG_TEXT}s`,
    component: OrganizationListLoadableComponent,
    auth: true,
    pageTitle: 'pageTitle.orgList',
    sidebar: false,
    header: false,
    fullWidth: true,
    applyReskin: true,
  },
  ...oldOrgListPaths,
  {
    path: '/team-deprecated',
    component: TeamConvertPage,
    auth: true,
    sidebar: false,
    header: false,
    fullWidth: true,
  },
  {
    path: '/download',
    component: DownloadLoadableComponent,
    auth: false,
    sidebar: false,
    header: false,
  },
  {
    path: Routers.OPEN_LUMIN,
    component: OpenLuminLoadable,
    auth: false,
    sidebar: false,
    header: false,
  },
  {
    path: '/redirection',
    component: RedirectionLoadableComponent,
    auth: true,
    sidebar: false,
    header: false,
    fullWidth: true,
    pageTitle: 'pageTitle.redirection',
    condition: ({ location }) => {
      const { search } = location;
      const searchParams = new URLSearchParams(search);
      return Boolean(searchParams.has(UrlSearchParam.REDIRECT_URL));
    },
  },
  // FIXME
  // {
  //   path: '/templates/:type',
  //   component: TemplatesLoadableComponent,
  //   auth: true,
  //   pageTitle: 'Templates | My Templates',
  //   condition: ({ match }) => match.params.type === TEMPLATE_TABS.PERSONAL,
  // },
  // {
  //   path: '/templates',
  //   component: () => <Redirect to="/templates/personal" replace />,
  //   auth: true,
  //   pageTitle: 'Templates | My Templates',
  // },
  {
    path: Routers.JOIN_YOUR_ORGANIZATIONS,
    component: JoinOrganizations,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    pageTitle: 'pageTitle.joinYourOrgs',
    applyReskin: true,
  },
  {
    path: NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION,
    component: JoinCircle,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    applyReskin: true,
    pageTitle: joinYourOrgPageTitle,
  },
  {
    path: '/join-your-circle',
    component: () => <Navigate to={NEW_AUTH_FLOW_ROUTE.JOIN_YOUR_ORGANIZATION} />,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    pageTitle: joinYourOrgPageTitle,
  },
  {
    path: NEW_AUTH_FLOW_ROUTE.SUBMIT_REQUEST_SUCCESSFULLY,
    component: SubmitRequestSuccessfully,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    applyReskin: true,
    pageTitle: 'pageTitle.submitRequestSuccessfully',
  },
  {
    path: NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION,
    component: SetUpOrganization,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    applyReskin: true,
    pageTitle: 'pageTitle.setUpOrg',
  },
  {
    path: '/set-up-circle',
    component: () => <Navigate to={NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION} />,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    pageTitle: 'pageTitle.setUpOrg',
  },
  {
    path: `${Routers.INVITE_LINK}/:inviteLinkId`,
    component: InviteLinkVerification,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    pageTitle: 'pageTitle.inviteLink',
    applyReskin: true,
  },
  {
    path: '/open/google/wrong-account',
    component: WrongAccountLoadable,
    sidebar: false,
    header: false,
    auth: false,
    fullWidth: true,
    pageTitle: 'pageTitle.openDrive',
  },
  {
    path: '/open/file/wrong-account',
    component: WrongAccountLoadable,
    sidebar: false,
    header: false,
    auth: false,
    fullWidth: true,
    pageTitle: 'pageTitle.openDrive',
  },
  {
    path: '/technical-issue',
    component: TechnicalIssueLoadable,
    sidebar: false,
    header: false,
    auth: false,
    fullWidth: true,
    pageTitle: 'common.somethingWentWrong',
  },
  {
    path: NEW_AUTH_FLOW_ROUTE.JOIN_ORGANIZATION_FROM_OPEN_DRIVE,
    component: JoinOrganizationFromOpenDrive,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    pageTitle: joinYourOrgPageTitle,
    applyReskin: true,
  },
  {
    path: '/join-circle-from-open-drive',
    component: () => <Navigate to={NEW_AUTH_FLOW_ROUTE.JOIN_ORGANIZATION_FROM_OPEN_DRIVE} />,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    pageTitle: joinYourOrgPageTitle,
  },
  {
    path: '/oauth/dropbox',
    auth: true,
    applyReskin: true,
    component: OAuthDropboxComponent,
  },
  {
    path: Routers.ONE_DRIVE_ADD_INS_AUTHORIZATION,
    component: OneDriveAddInsAuthorizationPage,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    pageTitle: 'pageTitle.oneDriveAddInsAuthorization',
    applyReskin: true,
  },
  {
    path: '*',
    component: NotFoundLoadableComponent,
    sidebar: false,
    header: false,
  },
  {
    path: ROUTE_MATCH.PAYMENT_CHECKOUT,
    component: CheckoutPageLoadableComponent,
    auth: true,
    sidebar: false,
    header: false,
    fullWidth: true,
    pageTitle: 'pageTitle.freeTrial',
  },
  {
    path: Routers.INVITE_COLLABORATORS,
    component: InviteCollaborators,
    sidebar: false,
    header: false,
    auth: true,
    fullWidth: true,
    applyReskin: true,
    pageTitle: joinYourOrgPageTitle,
  },
];
export default routes;
