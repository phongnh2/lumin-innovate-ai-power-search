import { isEmpty } from 'lodash';
import React, { useContext, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { FreeTrialBoardContext } from 'lumin-components/FreeTrialBoard/context';
import FreeTrialContext from 'lumin-components/OrganizationFreeTrial/FreeTrialContext';

import { PaymentInfoContext } from 'HOC/withGetPaymentInfo';
import { WarningBannerContext } from 'src/HOC/withWarningBanner';

import useCreateCredentials from 'hooks/useCreateCredentials';

import { paymentServices } from 'services';

import logger from 'helpers/logger';

import { toastUtils, orgUtil, errorUtils } from 'utils';
import paymentEvent from 'utils/Factory/EventCollection/PaymentEventCollection';
import { PaymentUtilities } from 'utils/Factory/Payment';
import { isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import { useSendPurchaseEvent } from 'features/CNC/hooks/useSendPurchaseEvent';
import {
  useHandlePreventUsingPrepaidCard,
  useSendLogPreventPrepaidCard,
} from 'features/PNB/PreventUsingPrepaidCard/hooks';

import { WarningBannerType } from 'constants/banner';
import { ErrorCode } from 'constants/errorCode';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes } from 'constants/lumin-common';
import { MESSAGE_PURCHASE_FREE_TRIAL_FAILED } from 'constants/messages';
import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { ORG_TEXT, ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PERIOD, PLAN_TYPE_LABEL, PaymentTypes, Plans } from 'constants/plan';
import { NEW_AUTH_FLOW_ROUTE, Routers } from 'constants/Routers';
import { ENV } from 'constants/urls';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import useAvailablePersonalWorkspace from './useAvailablePersonalWorkspace';
import useCreateOrganizationInPayment from './useCreateOrganizationInPayment';
import useGetCurrentOrganization from './useGetCurrentOrganization';
import useGetFlagExtendFreeTrial from './useGetFlagExtendFreeTrial';
import useMatchPaymentRoute from './useMatchPaymentRoute';
import useReactivateAccount from './useReactivateAccount';
import useRestrictBillingActions from './useRestrictBillingActions';
import { useTrackFormEvent } from './useTrackFormEvent';
import { useTranslation } from './useTranslation';

const getErrorMessage = (t) => ({
  [ErrorCode.Payment.CANNOT_USE_LOWER_TRIAL]: t('errorMessage.youCanNotStartThisTrial'),
  [ErrorCode.Payment.CARD_DECLINED]: t('errorMessage.yourCardHasBeenDeclined'),
  [ErrorCode.Payment.EXPIRED_CARD]: t('errorMessage.yourCardHasExpired'),
  [ErrorCode.Payment.INCORRECT_CVC]: t('errorMessage.yourCardSecurityCodeIsIncorrect'),
});

const boldTextColor = 'var(--kiwi-colors-surface-on-surface)';
const boldTextStyle = { color: boldTextColor, fontWeight: 700 };
const confirmButtonProps = {
  withExpandedSpace: true,
};

export function useClaimFreeTrial({
  newOrganization,
  onOpenExtendFreeTrialModal,
  from = '',
  refetchNewSecret = () => {},
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { plan, isMonthly, period } = useMatchPaymentRoute();
  const { triggerEvent } = useContext(PaymentInfoContext);
  const { billingInfo, currentPaymentMethod } = useContext(FreeTrialContext);
  const bannerContextValue = useContext(WarningBannerContext);
  const { getNewSecret } = useContext(FreeTrialBoardContext);
  const { refetch: refetchBillingWarning } = bannerContextValue[WarningBannerType.BILLING_WARNING.value];
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual).data || [];
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual) || [];
  const isPurchasing = useSelector(selectors.getPurchaseState);
  const { isCardFilled, currency, organizationId } = billingInfo;
  const { createOrganization } = useCreateOrganizationInPayment({
    newOrganization,
  });
  const { organization: selectedOrganization } =
    useSelector((state) => selectors.getOrganizationById(state, organizationId), shallowEqual) || {};
  const { payment: targetPayment = {}, name } = selectedOrganization || {};
  const paymentUtilities = useMemo(() => new PaymentUtilities(targetPayment), [targetPayment]);
  const { trackSubmitForm } = useTrackFormEvent();
  const { createCustomerCredentials } = useCreateCredentials();
  const params = new URLSearchParams(location.search);
  const { isShowExtendFreeTrialModal } = useGetFlagExtendFreeTrial();
  const { sendPurchaseEvent } = useSendPurchaseEvent();
  const { isRestrictedOrg, openRestrictActionsModal } = useRestrictBillingActions({ orgId: selectedOrganization?._id });
  const isProfessionalUser = useAvailablePersonalWorkspace();
  const currentOrg = useGetCurrentOrganization();

  const resetPaymentElement = () => {
    if (from === Routers.CHECKOUT) {
      refetchNewSecret();
    } else {
      getNewSecret();
    }
  };

  const { logPreinspectCardInfo, logPaymentError } = useSendLogPreventPrepaidCard();
  const { openPreventUsingPrepaidCardModal } = useHandlePreventUsingPrepaidCard({
    organization: selectedOrganization,
    stripeAccountId: billingInfo.stripeAccountId,
    resetPaymentElement,
    from,
  });

  const eventParams = {
    freeTrialDays: FREE_TRIAL_DAYS,
    organizationId,
    ...(targetPayment.customerRemoteId && { StripeCustomerId: targetPayment.customerRemoteId }),
  };

  const trackUserFillPaymentForm = ({ fieldName, action }) => {
    triggerEvent({
      callback: paymentEvent.userFillPaymentForm.bind(paymentEvent),
      params: { ...eventParams, fieldName, organizationId, action },
    });
  };

  const isPremiumPersonalPlan = () => [Plans.PROFESSIONAL, Plans.PERSONAL].includes(currentUser.payment.type);

  const isLowerPeriod = () => isMonthly && paymentUtilities.isAnnualPeriod();

  const logToPinpoint = (msg, cardInfo) => {
    triggerEvent({
      callback: paymentEvent.paymentError.bind(paymentEvent),
      params: {
        ...eventParams,
        ...cardInfo,
        errorMessage: msg,
      },
    });
  };

  const getContentModal = () => ({
    type: ModalTypes.ERROR,
    title: t('modalErrorSameTrial.title'),
    confirmButtonTitle: t('common.reload'),
    message: (
      <Trans i18nKey="modalErrorSameTrial.message" values={{ name }} components={{ b: <b style={boldTextStyle} /> }} />
    ),
    onConfirm: () => window.location.reload(),
    useReskinModal: true,
    closeOnRouteChange: true,
  });

  const getContentUpgradingInvoiceModal = (metadata) => ({
    type: ModalTypes.WARNING,
    title: t('modalChangingPlan.title'),
    message:
      metadata.plan === Plans.ENTERPRISE ? (
        <Trans
          i18nKey="modalChangingPlan.message"
          values={{ plan: PLAN_TYPE_LABEL[metadata.plan] }}
          components={{ b: <strong style={boldTextStyle} /> }}
        />
      ) : (
        <Trans
          i18nKey="modalChangingPlan.message"
          values={{
            plan: PLAN_TYPE_LABEL[metadata.plan],
            period: metadata.period === PERIOD.MONTHLY ? t('freeTrialPage.monthly') : t('freeTrialPage.annual'),
            docStack: metadata.docStack,
          }}
          components={{ b: <strong style={boldTextStyle} /> }}
        />
      ),
    confirmButtonTitle: t('common.ok'),
    confirmButtonProps,
    useReskinModal: true,
    closeOnRouteChange: true,
  });

  const handleError = (err) => {
    let msg = null;
    const { code, message, stopped, metadata, isSetupIntentError } = errorUtils.extractGqlError(err);
    let modalSettings;

    if (code === ErrorCode.Org.UPGRADING_INVOICE) {
      modalSettings = getContentUpgradingInvoiceModal(metadata);
      dispatch(actions.openModal(modalSettings));
      return;
    }

    if (code !== ErrorCode.Payment.CANNOT_USE_SAME_TRIAL) {
      const messageMapping = getErrorMessage(t);
      msg = messageMapping[code] || messageMapping[message] || message || t(MESSAGE_PURCHASE_FREE_TRIAL_FAILED);

      try {
        JSON.parse(message);
        logger.logError({ message: `PaymentError: ${message}` });
      } catch {
        logToPinpoint(msg);
      }
      if (stopped) {
        return;
      }
      modalSettings = isSetupIntentError
        ? {
            type: ModalTypes.ERROR,
            title: t('common.failed'),
            confirmButtonTitle: t('common.ok'),
            message: msg,
            useReskinModal: true,
            confirmButtonProps,
          }
        : {
            type: ModalTypes.ERROR,
            title: t('common.failed'),
            confirmButtonTitle: t('common.reload'),
            message: msg,
            onConfirm: () => window.location.reload(),
            disableBackdropClick: true,
            disableEscapeKeyDown: true,
            useReskinModal: true,
          };
    } else {
      modalSettings = getContentModal();
    }
    dispatch(actions.openModal({ ...modalSettings, closeOnRouteChange: true }));
  };

  const handleRedirect = (organization) => {
    const returnUrl = params.get(UrlSearchParam.RETURN_URL);
    const continueUrl = params.get(UrlSearchParam.CONTINUE_URL);
    const orgPageUrl = getDefaultOrgUrl({ orgUrl: organization.url });

    if (isUserInNewAuthenTestingScope(currentUser)) {
      navigate(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION, {
        state: {
          createdOrg: organization,
          fromPayment: true,
        },
      });
    } else {
      navigate(continueUrl || returnUrl || orgPageUrl, {
        state: {
          fromNewAuthFlow: true,
        },
      });
    }
  };

  const handleOnConfirmModal = (organization) => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    handleRedirect(organization);
  };

  const trackEvent = ({ customerRemoteId, subscriptionRemoteId, planRemoteId, cardInfo, organization }) => {
    triggerEvent({
      callback: paymentEvent.paymentSuccess.bind(paymentEvent),
      params: {
        ...eventParams,
        ...cardInfo,
        StripeCustomerId: customerRemoteId,
        subscriptionRemoteId,
        planRemoteId,
      },
    });

    sendPurchaseEvent({ subscriptionRemoteId, currency, organization });
  };

  const openSuccessModal = (organization) => {
    const { name: orgName, url } = organization;
    dispatch(
      actions.openModal({
        type: ModalTypes.TADA,
        title: t('freeTrialPage.freeTrialActivated'),
        message: (
          <Trans
            i18nKey="freeTrialPage.freeTrialActivatedMessage"
            values={{
              orgName,
              freeTrialDays: FREE_TRIAL_DAYS,
            }}
            components={{
              b: <b style={{ color: boldTextColor, fontWeight: 700 }} />,
            }}
          />
        ),
        cancelButtonTitle: t('common.gotIt'),
        confirmButtonTitle: t('freeTrialPage.manageSubscription'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        titleCentered: true,
        confetti: true,
        onCancel: () => handleOnConfirmModal(organization),
        onConfirm: () => {
          navigate(`/${ORG_TEXT}/${url}/dashboard/billing`);
        },
        useReskinModal: true,
        closeOnRouteChange: true,
      })
    );
  };

  const handleChargeSuccess = ({ newOrganization: _newOrganization, payment, cardInfo }) => {
    trackEvent({
      cardInfo,
      customerRemoteId: payment.customerRemoteId,
      subscriptionRemoteId: payment.subscriptionRemoteId,
      planRemoteId: payment.planRemoteId,
      organization: _newOrganization,
    });

    const userIsMemberInOrg = _newOrganization.userRole.toUpperCase() === ORGANIZATION_ROLES.MEMBER;
    const userRole = userIsMemberInOrg ? ORGANIZATION_ROLES.BILLING_MODERATOR.toLowerCase() : _newOrganization.userRole;

    const updatedOrg = {
      ..._newOrganization,
      payment: { ..._newOrganization.payment, ...payment },
      userRole,
    };

    dispatch(actions.updateOrganizationInList(_newOrganization._id, updatedOrg));

    if (currentOrg && currentOrg._id === updatedOrg._id) {
      dispatch(actions.updateCurrentOrganization(updatedOrg));
    }

    if (isShowExtendFreeTrialModal) {
      toastUtils.success({ message: t('freeTrialPage.freeTrialActivated') });
      onOpenExtendFreeTrialModal();
      return;
    }

    openSuccessModal(_newOrganization);
  };

  const upgradeTrial = async (organization) => {
    const { _id: orgId } = organization;
    const paymentData = await paymentServices.createFreeTrialUnifySubscription({
      orgId,
      period,
      currency,
      stripeAccountId: billingInfo.stripeAccountId,
      subscriptionItems: [
        {
          productName: UnifySubscriptionProduct.PDF,
          planName: plan,
          quantity: 1,
        },
      ],
    });
    refetchBillingWarning(selectedOrganization._id, PaymentTypes.ORGANIZATION);
    handleChargeSuccess({
      newOrganization: organization,
      payment: paymentData,
    });
  };

  const handlePrepaidCardStartTrial = (cardInfo) => {
    logPaymentError('Prepaid card cannot start free trial');
    openPreventUsingPrepaidCardModal(cardInfo);
  };

  const createNewTrial = async (organization) => {
    const { _id: orgId } = organization;
    const { issuedId, cardInfo } = await createCustomerCredentials({
      organizationId: orgId,
      stripeAccountId: billingInfo.stripeAccountId,
    });

    if (cardInfo) {
      // log pre-inspect card event
      logPreinspectCardInfo(cardInfo);
      if (
        cardInfo.cardFunding === 'prepaid' ||
        // Because we don't have Sutton Bank in test mode, so we use amex card instead
        (!['production', 'staging'].includes(ENV) && cardInfo.cardBrand === 'amex')
      ) {
        handlePrepaidCardStartTrial(cardInfo);
        return;
      }
    }
    const paymentData = await paymentServices.createFreeTrialUnifySubscription({
      orgId,
      paymentMethod: issuedId,
      period,
      currency,
      stripeAccountId: billingInfo.stripeAccountId,
      ...(cardInfo?.cardFunding === 'prepaid' && { isBlockedPrepaidCardOnTrial: false }),
      subscriptionItems: [
        {
          productName: UnifySubscriptionProduct.PDF,
          planName: plan,
          quantity: 1,
        },
      ],
    });
    handleChargeSuccess({
      newOrganization: organization,
      payment: paymentData,
      cardInfo,
    });
  };

  const onCompletePurchase = async (organization) => {
    try {
      const org = organization || selectedOrganization;
      if (currentPaymentMethod && org.userRole.toUpperCase() !== ORGANIZATION_ROLES.MEMBER) {
        await upgradeTrial(org);
      } else {
        await createNewTrial(org);
      }
    } catch (error) {
      handleError(error);
    } finally {
      dispatch(actions.setPurchaseState(false));
    }
  };

  const { openReactivateModal } = useReactivateAccount({
    organization: selectedOrganization,
    handleAfterReactivate: () => onCompletePurchase(selectedOrganization),
    handleAfterCancelReactivate: () => dispatch(actions.setPurchaseState(false)),
  });

  const createOrgAndPurchase = async () => {
    try {
      const organization = await createOrganization();
      const createdOrgWithRole = orgUtil.mappingOrgWithRoleAndTeams(organization);
      dispatch(actions.setOrganizations([...organizationList, createdOrgWithRole]));
      await onCompletePurchase(organization);
      dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: organization.url }));
      localStorage.setItem(LocalStorageKey.HAS_CREATED_ORGANIZATION_ON_PAYMENT_PAGE, 'true');
    } catch (err) {
      toastUtils.openUnknownErrorToast();
    }
  };

  const beforePurchase = async (e) => {
    if (isRestrictedOrg) {
      openRestrictActionsModal();
      return;
    }
    dispatch(actions.setPurchaseState(true));
    trackSubmitForm(e);
    triggerEvent({
      callback: paymentEvent.userSubmitPaymentForm.bind(paymentEvent),
      params: eventParams,
    });
    if (!availablePaidOrgs.length) {
      await createOrgAndPurchase();
    } else if (currentUser.deletedAt) {
      openReactivateModal();
    } else {
      await onCompletePurchase();
    }
  };

  const canClaimTrial = () => {
    if (!availablePaidOrgs.length && !isPremiumPersonalPlan()) {
      return !newOrganization?.error;
    }

    return (
      !isLowerPeriod() &&
      !isPremiumPersonalPlan() &&
      !isEmpty(targetPayment) &&
      orgUtil.canStartTrialPlan(plan, targetPayment.trialInfo)
    );
  };

  const getClaimCtaTooltip = () => {
    if (canClaimTrial()) {
      return '';
    }
    if (isProfessionalUser) {
      return t('freeTrialPage.higherToLowerTrialTierTooltip');
    }
    if (selectedOrganization) {
      if (!paymentUtilities.isSignFree()) {
        return t('freeTrialPage.activeSignTooltip');
      }
      return t('freeTrialPage.higherToLowerTrialTierTooltip');
    }
    return '';
  };

  return {
    disabled: !isCardFilled,
    loading: isPurchasing,
    onClaim: beforePurchase,
    canClaimTrial: canClaimTrial(),
    claimCtaTooltip: getClaimCtaTooltip(),
    trackUserFillPaymentForm,
  };
}
