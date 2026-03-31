import BusinessImage from 'assets/images/business.svg';
import EnterpriseImage from 'assets/images/enterprise-image.svg';
import FreePlanImage from 'assets/images/free.svg';
import ProfessionalPlanImage from 'assets/images/professional-image.svg';

import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PLAN_TYPE, PRICE, TEAM_CONVERT_TO_ORGANIZATION_PRICE } from 'constants/plan';

const featureUpload = ['plan.planExplain.unlimitedEditingFeatures', 'plan.planExplain.unlimitedUploads'];

const featureESignatures = ['plan.planExplain.unlimitedESignatures'];

const noAdvertising = ['plan.planExplain.noAdvertising'];

const eSignatures = ['plan.planExplain.2ESignatures'];

const emailSupport = ['plan.planExplain.priorityEmailSupport'];

const pageTools = ['plan.planExplain.unlimitedPageTools'];

const BUTTON_FREE_TEXT = 'Get Started';

const BUTTON_PRO_TEXT = `Start Free ${FREE_TRIAL_DAYS}-Day Trial`;

const freeFeature = [
  'plan.planExplain.accessLimitedFeatures',
  'plan.planExplain.limitedFileUploadSize5MB',
  ...eSignatures,
  'plan.planExplain.emailSupport',
];

const basicFeature = [
  ...featureUpload,
  ...featureESignatures,
  ...pageTools,
  ...noAdvertising,
  ...emailSupport,
];

const organizationFreeFeature = [
  'plan.planExplain.basicEditingFeatures',
  'plan.planExplain.limitedUploads20PerDay',
  ...eSignatures,
  'plan.planExplain.createAndManageTwoTeams',
];

const organizationFeature = [
  ...featureUpload,
  ...featureESignatures,
  ...pageTools,
  ...noAdvertising,
  ...emailSupport,
  'plan.planExplain.circleInsights',
  'plan.planExplain.createAndManageUnlimitedTeams',
  'plan.planExplain.dedicatedAccountManager',
];
const organizationEnterpriseFeature = [
  'plan.planExplain.conciergeOnboarding',
  'plan.planExplain.apiIntegration',
  'plan.planExplain.enterpriseGradeSecurity',
  'plan.planExplain.automateUserAndAccessManagement',
];

export const PlanIndividualMonthlyData = [
  {
    title: 'Free',
    type: 'FREE',
    price: PRICE.FREE,
    individual: true,
    featured: false,
    image: FreePlanImage,
    unit: '/month',
    feature: freeFeature,
    textButton: BUTTON_FREE_TEXT,
  },
  {
    title: 'Professional',
    type: 'PROFESSIONAL',
    price: PRICE.V2.MONTHLY.PROFESSIONAL,
    individual: true,
    featured: true,
    image: ProfessionalPlanImage,
    unit: '/month',
    feature: basicFeature,
    textButton: BUTTON_PRO_TEXT,
  },
];

export const PlanIndividualYearlyData = [
  {
    ...PlanIndividualMonthlyData[0],
    unit: '/year',
  },
  {
    ...PlanIndividualMonthlyData[1],
    price: PRICE.V2.ANNUAL.PROFESSIONAL,
    unit: '/year',
  },
];

export const PlanOrganizationMonthlyData = [
  {
    title: 'Free',
    type: PLAN_TYPE.FREE,
    price: PRICE.FREE,
    featured: false,
    image: FreePlanImage,
    unit: '/month',
    feature: organizationFreeFeature,
    textButton: BUTTON_FREE_TEXT,
  },
  {
    title: 'Business',
    type: PLAN_TYPE.BUSINESS,
    price: PRICE.V2.MONTHLY.BUSINESS,
    featured: true,
    image: BusinessImage,
    unit: '/month',
    feature: organizationFeature,
    textButton: BUTTON_PRO_TEXT,
  },
  {
    title: 'Enterprise',
    type: PLAN_TYPE.ENTERPRISE,
    price: undefined,
    featured: false,
    image: EnterpriseImage,
    unit: '/month',
    feature: organizationEnterpriseFeature,
    textButton: 'Get a Free Quote',
  },
];

export const PlanOrganizationFromTeamMonthlyData = [
  {
    ...PlanOrganizationMonthlyData[0],
  },
  {
    ...PlanOrganizationMonthlyData[1],
    price: TEAM_CONVERT_TO_ORGANIZATION_PRICE.MONTHLY,
  },
  {
    ...PlanOrganizationMonthlyData[2],
  },
];

export const PlanOrganizationYearlyData = [
  {
    ...PlanOrganizationMonthlyData[0],
    unit: '/year',
  },
  {
    ...PlanOrganizationMonthlyData[1],
    price: PRICE.V2.ANNUAL.BUSINESS,
    unit: '/year',
  },
  {
    ...PlanOrganizationMonthlyData[2],
    unit: '/year',
  },
];

export const PlanOrganizationFromTeamYearlyData = [
  {
    ...PlanOrganizationMonthlyData[0],
    unit: '/year',
  },
  {
    ...PlanOrganizationMonthlyData[1],
    price: TEAM_CONVERT_TO_ORGANIZATION_PRICE.ANNUAL,
    unit: '/year',
  },
  {
    ...PlanOrganizationMonthlyData[2],
    unit: '/year',
  },
];

export const PlanOrganizationMonthlyDataEnterprise = [
  {
    ...PlanOrganizationMonthlyData[0],
  },
  {
    ...PlanOrganizationMonthlyData[1],
  },
  {
    ...PlanOrganizationMonthlyData[2],
  },
];

export const PlanOrganizationYearlyDataEnterprise = [
  {
    ...PlanOrganizationYearlyData[0],
  },
  {
    ...PlanOrganizationYearlyData[1],
  },
  {
    ...PlanOrganizationYearlyData[2],
  },
];
