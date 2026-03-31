import { APP_NAMES, APP_URL_PATH } from 'features/MiniApps/constants';

import { ORGANIZATION_TEXT, ORG_TEXT, ORG_TRANSFER_URL } from './organizationConstants';
import { TEAM_TEXT, TEAMS_TEXT } from './teamConstant';
import { STATIC_PAGE_URL } from './urls';

export const DOCUMENT_ROUTES = {
  PERSONAL: '/documents/personal',
  SHARED: '/documents/shared',
  STARRED: '/documents/starred',
};

export const Routers = {
  VIEWER: '/viewer',
  VIEWER_TEMP_EDIT: '/viewer/temp-edit',
  VIEWER_TEMP_EDIT_EXTERNAL_PDF: '/viewer/temp-edit/external-pdf',
  ROOT: '/',
  NOT_FOUND: '/notFound',
  DOCUMENTS: '/documents',
  TEMPLATE: '/template',
  PERSONAL_TEMPLATES: '/templates/personal',
  DOWNLOAD: '/download',
  INDIVIDUAL_MONTHLY_PAYMENT_URL: '/payment/individual/monthly',
  INVITATION_REGISTRATION: '/invitation/registration',
  ORGANIZATION: `/${ORG_TEXT}`,
  ORGANIZATION_CREATE: `/${ORG_TEXT}/create`,
  ORGANIZATION_LIST: `/${ORG_TEXT}s`,
  ORG_ANNUAL_PAYMENT_URL: `/payment/${ORG_TEXT}/annual`,
  PAYMENT: '/payment',
  PAYMENT_FREE_TRIAL: '/payment/free-trial',
  PLANS: '/plans',
  REQUEST_ACCESS: '/request-access',
  REQUEST_ACCESS_TEMPLATE: '/template/request-access',
  REQUEST_SUBMITTED: '/request-submitted',
  SIGNIN: '/authentication/signin',
  SIGNUP: '/authentication/signup',
  FREE_SIGNUP: '/authentication/free-signup',
  TRIAL_SIGNUP: '/authentication/trial-signup',
  TRIAL_SIGNIN: '/authentication/trial-signin',
  PERSONAL_DOCUMENT: DOCUMENT_ROUTES.PERSONAL,
  SHARED_DOCUMENT: DOCUMENT_ROUTES.SHARED,
  DEVICE_DOCUMENT: '/documents/on-my-device',
  STARRED_DOCUMENT: DOCUMENT_ROUTES.STARRED,
  SETTING: {
    GENERAL: '/setting/general',
    PROFILE: '/setting/profile',
    PREFERENCES: '/setting/preferences',
    BILLING: '/setting/billing',
  },
  APPLE_CALLBACK: '/auth/verify-apple',
  INVITATION_MAIL: '/invitation/registration',
  SET_UP_ORGANIZATION: `/set-up-${ORG_TEXT}`,
  JOIN_YOUR_ORGANIZATION: `/join-your-${ORG_TEXT}`,
  JOIN_ORGANIZATION_SUCCESSFULLY: `/join-${ORG_TEXT}-successfully`,
  JOIN_YOUR_ORGANIZATIONS: `/join-your-${ORG_TEXT}s`,
  SUBMIT_REQUEST_SUCCESSFULLY: '/submit-request-successfully',
  OPEN_FORM: '/open-form',
  CREATE_EXTERNAL_PDF: '/create-external-pdf',
  OPEN_DRIVE: '/open/google',
  AUTH_DOCUMENT: `/authorize-requested`,
  OPEN_LUMIN: 'open/lumin',
  TERMS_OF_USE: '/terms-of-use',
  PRICING_LUMIN: '/pricing/lumin',
  PRIVACY_POLICY: '/privacy-policy',
  JOIN_ORGANIZATION_FROM_OPEN_DRIVE: `/join-${ORG_TEXT}-from-open-drive`,
  SETTINGS: {
    ROOT: '/settings',
    GENERAL: '/settings/general',
    PREFERENCES: '/settings/preferences',
    BILLING: '/settings/billing',
  },
  INVITE_LINK: '/invite-link',
  CHECKOUT: 'checkout',
  ONE_DRIVE_ADD_INS_AUTHORIZATION: '/get-open-with-lumin-on-onedrive',
  INVITE_COLLABORATORS: '/invite-collaborators',
  SIGN: '/sign',
  WEBOPT: '/webopt',
  AGREEMENT_GEN: '/generate/documents',
};

export const AuthRouteType = {
  ORGANIZATION: `${ORGANIZATION_TEXT}`,
  COMMON: 'common',
};

export const ROUTE_MATCH = {
  ORGANIZATION: `/${ORG_TEXT}/:orgName/:tab?`,
  ORGANIZATION_DOCUMENTS: `/${ORG_TEXT}/:orgDomain/documents/:route`,
  ORGANIZATION_PLAN: `/${ORG_TEXT}/:orgName/plans`,
  ORGANIZATION_TRANSFER: `/${ORG_TEXT}/:orgName/${ORG_TRANSFER_URL}`,
  FOLDER_DOCUMENT: `/${ORG_TEXT}/:orgName/documents/:type/folder/:folderId`,
  VIEWER: '/viewer/:documentId',
  VIEWER_TEMP_EDIT: '/viewer/temp-edit/:formId/:formName',
  VIEWER_TEMP_EDIT_EXTERNAL_PDF: '/viewer/temp-edit/external-pdf',
  ORG_DOCUMENT: `/${ORG_TEXT}/:orgDomain/documents`,
  ORGANIZATION_FOLDER_DOCUMENT: {
    PERSONAL: `/${ORG_TEXT}/:orgDomain/documents/personal/folder/:folderId`,
    ORGANIZATION: `/${ORG_TEXT}/:orgDomain/documents/${ORG_TEXT}/folder/:folderId`,
    TEAM: `/${ORG_TEXT}/:orgDomain/documents/${TEAM_TEXT}/:teamId/folder/:folderId`,
  },
  TEAM_LIST: `/${ORG_TEXT}/:orgUrl/${TEAMS_TEXT}`,
  TEAM_DOCUMENT: `/${ORG_TEXT}/:orgDomain/documents/${TEAM_TEXT}/:teamId`,
  DOCUMENTS: '/documents/:type',
  ORGANIZATION_TEAM_TEMPLATES: `/${ORG_TEXT}/:orgName/templates/${TEAM_TEXT}/:teamId`,
  ORGANIZATION_TEMPLATES: `/${ORG_TEXT}/:orgName/templates/:type`,
  PERSONAL_TEMPLATES: `/${ORG_TEXT}/:orgName/templates/personal`,
  INVITATION_MAIL: '/invitation/registration/:regName',
  PAYMENT: '/payment/:planName/:period',
  DASHBOARD_ROOT: `/${ORG_TEXT}/:orgUrl/dashboard`,
  DASHBOARD: `/${ORG_TEXT}/:orgUrl/dashboard/:tab`,
  AUTHENTICATION: {
    ROOT: '/authentication',
    SIGNIN: '/authentication/signin',
    SIGNUP: '/authentication/signup',
    TRIAL_SIGNIN: '/authentication/trial-signin',
    TRIAL_SIGNUP: '/authentication/trial-signup',
  },
  DOCUMENT_NOT_FOUND: '/documents/notFound',
  CREATE_EXTERNAL_PDF: '/create-external-pdf',
  GUEST_VIEW: '/viewer/guest/:documentId',
  PAYMENT_FREE_TRIAL: '/payment/free-trial/:planName/:period',
  PREMIUM_USER_PATHS: {
    PERSONAL_DOCUMENTS: DOCUMENT_ROUTES.PERSONAL,
    SHARED_DOCUMENTS: DOCUMENT_ROUTES.SHARED,
    STARRED_DOCUMENT: DOCUMENT_ROUTES.STARRED,
    FOLDER_DOCUMENTS: '/documents/personal/folder/:folderId',
    SIGN_DOC_LIST: '/sign',
    WEBOPT_MODULE: '/webopt',
  },
  PERSONAL_DOCUMENTS: `/${ORG_TEXT}/:orgDomain/documents/personal`,
  SHARED_DOCUMENTS: `/${ORG_TEXT}/:orgDomain/documents/shared`,
  SIGN_DOC_LIST: `/${ORG_TEXT}/:orgDomain/sign`,
  WEBOPT_MODULE: `/${ORG_TEXT}/:orgDomain/webopt`,
  STARRED_DOCUMENTS: `/${ORG_TEXT}/:orgDomain/documents/starred`,
  SUBSCRIPTION: `/${ORG_TEXT}/:orgDomain/subscription`,
  XERO_INTEGRATION: `/${ORG_TEXT}/:orgDomain/${APP_URL_PATH}/${APP_NAMES.XERO_INTEGRATION}`,
  HOME: `/${ORG_TEXT}/:orgDomain/home`,
  TEMPLATES: `/${ORG_TEXT}/:orgDomain/templates`,
  RECENT_DOCUMENTS: `/${ORG_TEXT}/:orgDomain/home/recent`,
  TRENDING_DOCUMENTS: `/${ORG_TEXT}/:orgDomain/home/trending`,
  INVITE_LINK: '/invite-link/:inviteLinkId',
  PAYMENT_CHECKOUT: '/payment/checkout/:planName/:period',
  SETTINGS: '/settings',
  DASHBOARD_PEOPLE: `/${ORG_TEXT}/:orgDomain/dashboard/people`,
  AGREEMENT_GEN_LIST_MODULE: `/${ORG_TEXT}/:orgDomain/generate/:listType`,
  TEMPLATE_VIEWER: '/template/:documentId',
};

export const NEW_AUTH_FLOW_ROUTE = {
  SET_UP_ORGANIZATION: Routers.SET_UP_ORGANIZATION,
  JOIN_YOUR_ORGANIZATION: Routers.JOIN_YOUR_ORGANIZATION,
  JOIN_ORGANIZATION_SUCCESSFULLY: Routers.JOIN_ORGANIZATION_SUCCESSFULLY,
  SUBMIT_REQUEST_SUCCESSFULLY: Routers.SUBMIT_REQUEST_SUCCESSFULLY,
  JOIN_ORGANIZATION_FROM_OPEN_DRIVE: Routers.JOIN_ORGANIZATION_FROM_OPEN_DRIVE,
};

export const FEEDBACK_URL = 'https://feedback.luminpdf.com';

export const TRUSTPILOT_REVIEW_URL = 'https://www.trustpilot.com/evaluate/www.luminpdf.com';

export const LANDING_PAGE_ROUTE = {
  CONTACT_SUPPORT: `${STATIC_PAGE_URL}/contact-support`,
  OCR_BLOG: `${STATIC_PAGE_URL}/blog/what-is-optical-character-recognition-ocr`,
};

export const STATIC_PAGE_PRICING = `${STATIC_PAGE_URL}/pricing`;

export const ORG_ROUTES = {
  HOME_RECENT: '/home/recent',
  HOME_TRENDING: '/home/trending',
  DOCUMENTS_PERSONAL: DOCUMENT_ROUTES.PERSONAL,
  DOCUMENTS_SHARED: DOCUMENT_ROUTES.SHARED,
  DOCUMENTS_STARRED: DOCUMENT_ROUTES.STARRED,
  DASHBOARD_PREFERENCES: '/dashboard/preferences',
  DASHBOARD_BILLING: '/dashboard/billing',
  DASHBOARD_GENERAL: '/dashboard/general',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  DASHBOARD_TEAM: '/dashboard/team',
  DASHBOARD_TEAM_SETTINGS: '/dashboard/team/settings',
  DASHBOARD_TEAM_MEMBERS: '/dashboard/team/members',
  TEMPLATES: '/templates',
};

export const MARKETING_SLUGS = {
  LAST_ACCESSED: 'last_accessed',
};

export const MARKETING_SLUG_VALUES = Object.values(MARKETING_SLUGS);
