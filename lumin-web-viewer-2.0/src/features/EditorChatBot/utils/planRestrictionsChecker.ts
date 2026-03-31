import { TFunction } from 'i18next';
import { get } from 'lodash';

import selectors from 'selectors';
import { store } from 'store';

import organizationServices from 'services/organizationServices';

import getOrgIdOfDoc from 'helpers/getOrgIdOfDoc';
import { getToolChecker } from 'helpers/getToolPopper';

import { PaymentUrlSerializer } from 'utils/payment';

import { DOCUMENT_ROLES, FEATURE_VALIDATION } from 'constants/lumin-common';
import { PERIOD, Plans } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITrialInfo } from 'interfaces/payment/payment.interface';

import { TOOLS_NAME_MAPPING } from '../ai/permissionToolChecker';
import { ToolCallType } from '../types';

const PLAN_RESTRICTIONS_DESCRIPTION_KEY = 'viewer.chatbot.planRestrictions.description';

const getAdminMessage = ({
  t,
  canStartFreeTrial,
  featureName,
  paymentUrl,
}: {
  t: TFunction;
  canStartFreeTrial: boolean;
  featureName: string;
  paymentUrl: string;
}) =>
  `${t(PLAN_RESTRICTIONS_DESCRIPTION_KEY, { featureName })}${t('viewer.chatbot.planRestrictions.adminDetail', {
    context: canStartFreeTrial ? 'freeTrialAvailable' : 'freeTrialNotAvailable',
    paymentUrl,
  })}`;

const getMemberMessage = ({ t, featureName }: { t: TFunction; featureName: string }) =>
  `${t(PLAN_RESTRICTIONS_DESCRIPTION_KEY, { featureName })}${t('viewer.chatbot.planRestrictions.memberDetail')}`;

const getSharedUserMessage = ({
  t,
  featureName,
  paymentUrl,
}: {
  t: TFunction;
  featureName: string;
  paymentUrl: string;
}) =>
  `${t(PLAN_RESTRICTIONS_DESCRIPTION_KEY, { featureName })}${t('viewer.chatbot.planRestrictions.sharedUserDetail', {
    paymentUrl,
  })}`;

export const getPaymentUrl = ({
  orgId,
  canStartFreeTrial,
  plan,
}: {
  orgId?: string;
  canStartFreeTrial?: boolean;
  plan?: string;
} = {}) => {
  const paymentPlan = plan || Plans.ORG_PRO;
  const paymentUrlSerializer = new PaymentUrlSerializer();
  if (!orgId) {
    return paymentUrlSerializer.plan(paymentPlan).trial(canStartFreeTrial).period(PERIOD.ANNUAL).returnUrlParam().get();
  }

  return paymentUrlSerializer
    .of(orgId)
    .plan(paymentPlan)
    .trial(canStartFreeTrial)
    .period(PERIOD.ANNUAL)
    .returnUrlParam()
    .get();
};

export const checkPlanRestrictions = ({ toolCall, t }: { toolCall: ToolCallType; t: TFunction }) => {
  const key = toolCall.toolName as keyof typeof TOOLS_NAME_MAPPING;
  if (!TOOLS_NAME_MAPPING[key]) {
    return '';
  }

  const currentDocument = selectors.getCurrentDocument(store.getState());
  const currentUser = selectors.getCurrentUser(store.getState());
  const { isToolAvailable, validateType, toolPlanRequirements } = getToolChecker({
    toolName: TOOLS_NAME_MAPPING[key] as string,
    currentDocument,
    currentUser,
    translator: t,
  });
  if (isToolAvailable) {
    return '';
  }

  if (validateType === FEATURE_VALIDATION.PERMISSION_REQUIRED) {
    return `You need ${DOCUMENT_ROLES.EDITOR.toLowerCase()} access to use ${t(
      `viewer.chatbot.feature.${toolCall.toolName}`
    )}. Please request permission from the document owner`;
  }

  const orgOfDoc = get(currentDocument, 'documentReference.data', '') as IOrganization;
  const { userRole }: IOrganization = orgOfDoc || ({} as IOrganization);
  const trialInfo = get(orgOfDoc, 'payment.trialInfo', {} as ITrialInfo);
  const orgId = getOrgIdOfDoc({ currentDocument });
  const featureName = t(`viewer.chatbot.feature.${toolCall.toolName}`);
  const isOrgManager = organizationServices.isManager(userRole);
  if (isOrgManager) {
    return getAdminMessage({
      t,
      canStartFreeTrial: trialInfo.canUseProTrial,
      featureName,
      paymentUrl: getPaymentUrl({ orgId, canStartFreeTrial: trialInfo.canUseProTrial, plan: toolPlanRequirements }),
    });
  }

  const isOrgMember = organizationServices.isOrgMember(userRole);
  if (isOrgMember) {
    return getMemberMessage({ t, featureName });
  }

  const isSharedUser = get(currentDocument, 'isShared', false) || get(currentDocument, 'isGuest', false);
  if (isSharedUser) {
    return getSharedUserMessage({
      t,
      featureName,
      paymentUrl: getPaymentUrl({ plan: toolPlanRequirements }),
    });
  }

  throw new Error('Tool is not available but can not mapped to the correct plan restriction');
};
