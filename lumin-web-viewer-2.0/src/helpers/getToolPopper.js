import get from 'lodash/get';

import selectors from 'selectors';
import { store } from 'store';

import authServices from 'services/authServices';

import getCurrentRole from 'helpers/getCurrentRole';
import getOrgOfDoc from 'helpers/getOrgOfDoc';

import { validator } from 'utils';
import { PaymentUtilities } from 'utils/Factory/Payment';
import { PaymentUrlSerializer } from 'utils/payment';

import { accessToolModalActions } from 'features/ToolPermissionChecker/slices/accessToolModalSlice';

import { DOCUMENT_TYPE, ACCOUNTABLE_BY } from 'constants/documentConstants';
import { DOCUMENT_ROLES, FEATURE_VALIDATION } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { Plans, PLAN_TYPE_LABEL, PRICING_VERSION, PERIOD } from 'constants/plan';
import toolsName from 'constants/toolsName';

import getOrgIdOfDoc from './getOrgIdOfDoc';

const { getState, dispatch } = store;

const PREMIUM_FEATURE_TITLE = 'viewer.upgradeToAccess';

const getPermissionRequiredPopper = (role = '', translator = () => {}) => ({
  image: 'request-permission',
  title: translator('viewer.requestPermissionUpModal.permissionRequired'),
  type: role === DOCUMENT_ROLES.SPECTATOR ? DOCUMENT_ROLES.VIEWER : DOCUMENT_ROLES.EDITOR,
  message:
    role === DOCUMENT_ROLES.SPECTATOR
      ? translator('viewer.onlyCommentPermission')
      : translator('viewer.onlyEditPermission'),
});

const getPremiumFeaturePopper = ({ currentDocument, plan, translator, isRemoveButtonProStartTrial }) => {
  const paymentUrlSerializer = new PaymentUrlSerializer();
  let popperSettings = {
    title: translator(PREMIUM_FEATURE_TITLE),
    message: '',
    buttons: [],
  };
  const roleInOrg = get(currentDocument, 'documentReference.data.userRole', '').toUpperCase();
  const accountableBy = get(currentDocument, 'documentReference.accountableBy', '');
  const organizations = selectors.getOrganizationList(getState());

  const isOrganizationAdmin =
    accountableBy === ACCOUNTABLE_BY.ORGANIZATION &&
    [ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR].includes(roleInOrg);
  const documentOrgOwner = getOrgOfDoc({ organizations, currentDocument });
  const paymentUtilities = new PaymentUtilities(documentOrgOwner?.payment || {});
  const isFreeOrg = paymentUtilities.isUnifyFree();
  const isPersonalDocOwner = accountableBy === ACCOUNTABLE_BY.PERSONAL && !documentOrgOwner?.userRole;
  const isOrganizationDocumentType = currentDocument.documentType === DOCUMENT_TYPE.ORGANIZATION;
  const isMember = documentOrgOwner?.userRole?.toUpperCase() === ORGANIZATION_ROLES.MEMBER;
  const isFreeOrgMember = isFreeOrg && isMember;
  const isSharedDocument = isOrganizationDocumentType
    ? !isMember && currentDocument.isShared
    : currentDocument.isShared;
  const isSharedOrGuestUser = isSharedDocument || currentDocument.isGuest;
  const priceVersion = get(currentDocument, 'premiumToolsInfo.priceVersion', '');
  const currentPlan = get(currentDocument, 'documentReference.data.payment.type', '');
  const isOldPlan = priceVersion !== PRICING_VERSION.V3 && currentPlan !== Plans.FREE;
  if (isSharedOrGuestUser || isOrganizationAdmin || isFreeOrgMember || isPersonalDocOwner) {
    if (!isSharedOrGuestUser) {
      paymentUrlSerializer.of(get(currentDocument, 'documentReference.data._id', ''));
    }
    const trialInfo = get(currentDocument, 'documentReference.data.payment.trialInfo', {});
    const canStartTrial = plan === Plans.ORG_PRO ? trialInfo.canUseProTrial : trialInfo.canUseBusinessTrial;
    const orgId = getOrgIdOfDoc({ currentDocument });
    if (canStartTrial) {
      popperSettings = {
        ...popperSettings,
        message: translator('viewer.freeTrialSevenDays'),
        buttons: !isRemoveButtonProStartTrial
          ? [
              {
                label: translator('common.goPlan', { plan: PLAN_TYPE_LABEL[plan] }),
                type: 'primary',
                url: paymentUrlSerializer
                  .of(orgId)
                  .trial(false)
                  .plan(plan)
                  .period(PERIOD.ANNUAL)
                  .returnUrlParam()
                  .get(),
              },
              {
                label: translator('common.startFreeTrial'),
                type: 'danger',
                url: paymentUrlSerializer.of(orgId).trial(true).plan(plan).period(PERIOD.ANNUAL).returnUrlParam().get(),
              },
            ]
          : [
              {
                label: translator('common.startFreeTrial'),
                type: 'danger',
                url: paymentUrlSerializer.of(orgId).trial(true).plan(plan).period(PERIOD.ANNUAL).returnUrlParam().get(),
              },
            ],
      };
    } else {
      const priceVersion = get(currentDocument, 'premiumToolsInfo.priceVersion', '');
      const currentPlan = get(currentDocument, 'documentReference.data.payment.type', '');
      const isOldPlan = priceVersion !== PRICING_VERSION.V3 && currentPlan !== Plans.FREE;
      if (isOldPlan) {
        paymentUrlSerializer.of(orgId);
      }
      popperSettings = {
        ...popperSettings,
        message: translator('viewer.levelUpToUnlock'),
        buttons: [
          {
            url: paymentUrlSerializer.trial(false).plan(plan).period(PERIOD.ANNUAL).returnUrlParam().get(),
            label:
              isSharedOrGuestUser || isOldPlan
                ? translator('common.upgradeNow')
                : translator('common.goPlan', { plan: PLAN_TYPE_LABEL[plan] }),
            type: 'danger',
          },
        ],
      };
    }
  } else {
    popperSettings = {
      ...popperSettings,
      message: translator('viewer.contactAdministratorToUpgrade', {
        plan: isOldPlan ? 'new Business' : PLAN_TYPE_LABEL[plan],
      }),
    };
  }
  return popperSettings;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function getToolPopper({
  toolName,
  currentUser,
  currentDocument,
  translator,
  featureName,
  isRemoveButtonProStartTrial,
}) {
  const currentRole = getCurrentRole(currentDocument);
  const validateType = validator.validateFeature({ currentUser, currentDocument, toolName, featureName });

  let popperSettings = {
    title: '',
    message: '',
    buttons: [],
  };
  let toolPlanRequirements = null;
  if (validateType === FEATURE_VALIDATION.SIGNIN_REQUIRED) {
    popperSettings = {
      ...popperSettings,
      title: translator('viewer.makeACopy.signInRequired'),
      message: translator('viewer.makeACopy.messageSignInRequired'),
      buttons: [
        {
          callback: () => authServices.signInInsideViewer(currentDocument),
          label: translator('viewer.makeACopy.signInNow'),
          type: 'primary',
        },
      ],
    };
  } else if (validateType === FEATURE_VALIDATION.UNSUPPORTED_FILE_TYPE) {
    popperSettings = {
      ...popperSettings,
      title: translator('viewer.unsupportedFileTypeModal.title'),
      message: translator('viewer.unsupportedFileTypeModal.message'),
      buttons: [
        {
          label: translator('common.gotIt'),
          type: 'primary',
          callback: () => dispatch(accessToolModalActions.closeModal()),
        },
      ],
    };
  } else {
    switch (toolName) {
      case toolsName.STICKY:
        if (
          validateType === FEATURE_VALIDATION.PERMISSION_REQUIRED &&
          currentRole.toUpperCase() === DOCUMENT_ROLES.SPECTATOR
        ) {
          const permissionRequiredPopper = getPermissionRequiredPopper(currentRole.toUpperCase(), translator);
          popperSettings = { ...popperSettings, ...permissionRequiredPopper };
        }
        break;
      case toolsName.FREETEXT:
      case toolsName.FREEHAND:
      case toolsName.SIGNATURE:
      case toolsName.ERASER:
      case toolsName.FORM_FIELD_DETECTION:
        // role <= viewer
        if (validateType === FEATURE_VALIDATION.PERMISSION_REQUIRED) {
          const permissionRequiredPopper = getPermissionRequiredPopper('', translator);
          popperSettings = { ...popperSettings, ...permissionRequiredPopper };
        }
        break;
      case toolsName.PASSWORD_PROTECTION:
      case toolsName.COMPRESS_PDF:
      case toolsName.FORM_BUILDER:
      case toolsName.SYNC_ONE_DRIVE:
      case toolsName.REDACTION: {
        if (validateType === FEATURE_VALIDATION.PERMISSION_REQUIRED) {
          const permissionRequiredPopper = getPermissionRequiredPopper('', translator);
          popperSettings = { ...popperSettings, ...permissionRequiredPopper };
        }
        toolPlanRequirements = Plans.ORG_BUSINESS;
        if (validateType === FEATURE_VALIDATION.PREMIUM_FEATURE) {
          const premiumFeaturePopper = getPremiumFeaturePopper({
            currentDocument,
            plan: toolPlanRequirements,
            translator,
            isRemoveButtonProStartTrial,
          });
          popperSettings = { ...popperSettings, ...premiumFeaturePopper };
        }
        break;
      }
      default:
        if (validateType === FEATURE_VALIDATION.PERMISSION_REQUIRED) {
          const permissionRequiredPopper = getPermissionRequiredPopper('', translator);
          popperSettings = { ...popperSettings, ...permissionRequiredPopper };
        }
        toolPlanRequirements = Plans.ORG_PRO;
        if (validateType === FEATURE_VALIDATION.PREMIUM_FEATURE) {
          const premiumFeaturePopper = getPremiumFeaturePopper({
            currentDocument,
            plan: toolPlanRequirements,
            translator,
            isRemoveButtonProStartTrial,
          });
          popperSettings = { ...popperSettings, ...premiumFeaturePopper };
        }
        break;
    }
  }
  return {
    ...popperSettings,
    toolPlanRequirements,
    validateType,
  };
}

export const getToolChecker = ({ toolName, currentUser, currentDocument, translator, featureName }) => {
  const { title, message, validateType, toolPlanRequirements } = getToolPopper({
    toolName,
    currentUser,
    currentDocument,
    translator,
    featureName,
  });
  return {
    isToolAvailable: !title && !message,
    shouldShowPremiumIcon: title === translator(PREMIUM_FEATURE_TITLE),
    validateType,
    toolPlanRequirements,
  };
};
