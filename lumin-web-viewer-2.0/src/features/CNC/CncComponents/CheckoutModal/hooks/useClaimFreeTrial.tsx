import { isEmpty } from 'lodash';
import React, { ReactNode, useContext, useMemo } from 'react';
import { TFunction, Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import errorIcon from 'assets/lumin-svgs/error.svg';

import actions from 'actions';
import selectors from 'selectors';
import { RootState } from 'store';

import { PaymentInfoContext } from 'HOC/withGetPaymentInfo';

import { useCreateCredentials, useEnableWebReskin, useTranslation } from 'hooks';
import useRestrictBillingActions from 'hooks/useRestrictBillingActions';

import { paymentServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, orgUtil } from 'utils';
import { checkOutModalEvent } from 'utils/Factory/EventCollection/PaymentEventCollection';
import { PaymentUtilities } from 'utils/Factory/Payment';

import { useSendPurchaseEvent } from 'features/CNC/hooks';
import {
  useHandlePreventUsingPrepaidCard,
  useSendLogPreventPrepaidCard,
} from 'features/PNB/PreventUsingPrepaidCard/hooks';
import { CardInfo } from 'features/PNB/types';

import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import { MESSAGE_PURCHASE_FREE_TRIAL_FAILED } from 'constants/messages';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PERIOD, PLAN_TYPE_LABEL, Plans } from 'constants/plan';
import { PaymentPeriod } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';
import { ENV } from 'constants/urls';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationPayment, IPayment } from 'interfaces/payment/payment.interface';

import { CheckoutModalProviderContext } from '../CheckoutModalWithStripeElements';
import { CheckoutModalContext } from '../context/CheckoutModalContext';

interface Params {
  successModalContent?: {
    icon: ReactNode;
    title: ReactNode;
    message: ReactNode;
  };
  onSuccess?: () => void;
  onFailure?: ({ callback }: { callback?: () => void }) => void;
}

const boldTextColor = 'var(--kiwi-colors-surface-on-surface)';
const boldTextStyle = { color: boldTextColor, fontWeight: 700 };
const confirmButtonProps = {
  withExpandedSpace: true,
};

const getErrorMessage = (t: TFunction) => ({
  [ErrorCode.Payment.CANNOT_USE_LOWER_TRIAL]: t('errorMessage.youCanNotStartThisTrial'),
  [ErrorCode.Payment.CARD_DECLINED]: t('errorMessage.cardDeclined'),
  [ErrorCode.Payment.EXPIRED_CARD]: t('errorMessage.yourCardHasExpired'),
  [ErrorCode.Payment.INCORRECT_CVC]: t('errorMessage.yourCardSecurityCodeIsIncorrect'),
  [ErrorCode.Payment.SETUP_INTENT_UNEXPECTED_STATE]: t('errorMessage.yourCardHasBeenDeclined'),
});

const useClaimFreeTrial = (params: Params) => {
  const { successModalContent, onSuccess, onFailure } = params;
  const { t } = useTranslation();
  const { billingInfo, currentPaymentMethod } = useContext(CheckoutModalContext);
  const { getNewSecret } = useContext(CheckoutModalProviderContext);
  const { currency, organizationId, period, plan } = billingInfo;
  const isProcessing = useSelector(selectors.getPurchaseState);
  const dispatch = useDispatch();
  const isMonthly = period === PERIOD.MONTHLY;
  const { organization: selectedOrganization } =
    useSelector((state: RootState) => selectors.getOrganizationById(state, organizationId), shallowEqual) || {};
  const { logPreinspectCardInfo, logPaymentError } = useSendLogPreventPrepaidCard();
  const { createCustomerCredentials } = useCreateCredentials();
  const { sendPurchaseEvent } = useSendPurchaseEvent();
  const { isRestrictedOrg, openRestrictActionsModal } = useRestrictBillingActions({ orgId: selectedOrganization?._id });
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const { payment: targetPayment } = selectedOrganization || { payment: {} as IOrganizationPayment };
  const { isEnableReskin } = useEnableWebReskin();
  const paymentUtilities = useMemo(() => new PaymentUtilities(targetPayment), [targetPayment]);
  const navigate = useNavigate();
  const isLowerPeriod = () => isMonthly && paymentUtilities.isAnnualPeriod();

  const isPremiumPersonalPlan = () => [Plans.PROFESSIONAL, Plans.PERSONAL].includes(currentUser.payment.type);

  const { triggerEvent } = useContext(PaymentInfoContext);
  const { openPreventUsingPrepaidCardModal } = useHandlePreventUsingPrepaidCard({
    organization: selectedOrganization,
    stripeAccountId: billingInfo.stripeAccountId,
    resetPaymentElement: () => onFailure?.({ callback: getNewSecret }),
    isFromCheckoutModal: true,
  });

  const eventParams = {
    freeTrialDays: FREE_TRIAL_DAYS,
    organizationId,
    ...(targetPayment.customerRemoteId && { StripeCustomerId: targetPayment.customerRemoteId }),
  };

  const trackUserFillPaymentForm = ({ fieldName, action }: { fieldName: string; action: string }) => {
    triggerEvent({
      callback: checkOutModalEvent.userFillPaymentForm.bind(checkOutModalEvent) as () => void,
      params: { ...eventParams, fieldName, organizationId, action },
    });
  };

  const logToPinpoint = (msg: string, cardInfo?: CardInfo) => {
    triggerEvent({
      callback: checkOutModalEvent.paymentError.bind(checkOutModalEvent) as () => void,
      params: {
        ...eventParams,
        ...cardInfo,
        errorMessage: msg,
      },
    });
  };
  const getContentUpgradingInvoiceModal = (metadata: {
    plan: keyof typeof PLAN_TYPE_LABEL;
    period: string;
    docStack: string;
  }) => ({
    type: ModalTypes.WARNING,
    title: t('modalChangingPlan.title'),
    message:
      metadata.plan === Plans.ENTERPRISE ? (
        <Trans
          i18nKey="modalChangingPlan.message"
          values={{ plan: PLAN_TYPE_LABEL[metadata.plan] }}
          components={{ b: <strong style={isEnableReskin ? boldTextStyle : {}} /> }}
        />
      ) : (
        <Trans
          i18nKey="modalChangingPlan.message"
          values={{
            plan: PLAN_TYPE_LABEL[metadata.plan],
            period: metadata.period === PERIOD.MONTHLY ? t('freeTrialPage.monthly') : t('freeTrialPage.annual'),
            docStack: metadata.docStack,
          }}
          components={{ b: <strong style={isEnableReskin ? boldTextStyle : {}} /> }}
        />
      ),
    confirmButtonTitle: t('common.ok'),
    confirmButtonProps,
    useReskinModal: true,
    closeOnRouteChange: true,
  });

  const trackEvent = ({
    customerRemoteId,
    subscriptionRemoteId,
    planRemoteId,
    cardInfo,
    organization,
  }: {
    customerRemoteId: string;
    subscriptionRemoteId: string;
    planRemoteId: string;
    cardInfo: CardInfo;
    organization: IOrganization;
  }) => {
    triggerEvent({
      callback: checkOutModalEvent.paymentSuccess.bind(checkOutModalEvent) as () => void,
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

  const handlePrepaidCardStartTrial = (cardInfo: CardInfo) => {
    logPaymentError('Prepaid card cannot start free trial', cardInfo);
    openPreventUsingPrepaidCardModal(cardInfo);
  };

  const handleOnConfirmModal = () => {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    window.location.reload();
  };

  const openSuccessModal = () => {
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.TADA,
        title: successModalContent.title,
        message: successModalContent.message,
        confirmButtonProps: {
          withExpandedSpace: true,
        },
        confirmButtonTitle: t('common.ok'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        titleCentered: true,
        confetti: true,
        onConfirm: () => handleOnConfirmModal(),
        useReskinModal: true,
        closeOnRouteChange: true,
        icon: successModalContent.icon,
      })
    );
  };
  const getContentModal = () => ({
    type: ModalTypes.ERROR,
    title: t('checkoutModal.modalErrorSameTrial.title'),
    confirmButtonTitle: t('common.goToBilling'),
    cancelButtonTitle: t('common.dismiss'),
    message: (
      <Trans
        i18nKey="checkoutModal.modalErrorSameTrial.message"
        values={{ orgName: selectedOrganization?.name }}
        components={{ b: <b style={isEnableReskin ? boldTextStyle : {}} /> }}
      />
    ),
    onConfirm: () => navigate(Routers.SETTINGS.BILLING),
    onCancel: () => {
      window.location.reload();
    },
    useReskinModal: true,
    closeOnRouteChange: true,
  });
  const handleError = (err: Error) => {
    const { code, message, stopped, metadata, isSetupIntentError } = errorUtils.extractGqlError(err) as {
      code: string;
      message: string;
      stopped: boolean;
      metadata: { plan: keyof typeof PLAN_TYPE_LABEL; period: string; docStack: string };
      isSetupIntentError: boolean;
    };
    let modalSettings;
    let msg;
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
            title: t('common.paymentFailed'),
            confirmButtonTitle: t('common.updatePaymentDetails'),
            message: msg,
            useReskinModal: true,
            confirmButtonProps,
            icon: errorIcon,
            onConfirm: () => onFailure?.({ callback: getNewSecret }),
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
            icon: errorIcon,
          };
    } else {
      modalSettings = getContentModal();
    }
    dispatch(actions.openModal({ ...modalSettings, closeOnRouteChange: true }));
  };
  const handleChargeSuccess = ({
    newOrganization,
    payment,
    cardInfo,
  }: {
    newOrganization: IOrganization;
    payment: IPayment;
    cardInfo?: CardInfo;
  }) => {
    trackEvent({
      cardInfo,
      customerRemoteId: payment.customerRemoteId,
      subscriptionRemoteId: payment.subscriptionRemoteId,
      planRemoteId: payment.planRemoteId,
      organization: newOrganization,
    });
    const userIsMemberInOrg = newOrganization.userRole.toUpperCase() === ORGANIZATION_ROLES.MEMBER;
    const userRole = userIsMemberInOrg ? ORGANIZATION_ROLES.BILLING_MODERATOR.toLowerCase() : newOrganization.userRole;

    dispatch(
      actions.updateOrganizationInList(newOrganization._id, {
        ...newOrganization,
        payment: { ...newOrganization.payment, ...payment },
        userRole,
      })
    );
    dispatch(actions.fetchCurrentOrganization(newOrganization.url));

    onSuccess();
    openSuccessModal();
  };
  const createNewTrial = async (organization: IOrganization) => {
    try {
      const { _id: orgId } = organization;
      const { issuedId, issuer, cardInfo } = await createCustomerCredentials({
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

      const data = await paymentServices.createFreeTrialSubcription({
        orgId,
        issuedId,
        issuer,
        period: period as PaymentPeriod,
        currency,
        plan,
        stripeAccountId: billingInfo.stripeAccountId,
        ...(cardInfo?.cardFunding === 'prepaid' && { isBlockedPrepaidCardOnTrial: false }),
      });
      handleChargeSuccess({
        newOrganization: organization,
        payment: data,
      });
    } catch (error) {
      handleError(error);
    }
  };

  const upgradeTrial = async (organization: IOrganization) => {
    const { _id: orgId } = organization;
    const paymentData = await paymentServices.createFreeTrialSubcription({
      orgId,
      period: period as PaymentPeriod,
      currency,
      plan,
      stripeAccountId: billingInfo.stripeAccountId,
    });
    handleChargeSuccess({
      newOrganization: organization,
      payment: paymentData,
    });
  };

  const onCompletePurchase = async () => {
    try {
      if (currentPaymentMethod && selectedOrganization.userRole.toUpperCase() !== ORGANIZATION_ROLES.MEMBER) {
        await upgradeTrial(selectedOrganization);
      } else {
        await createNewTrial(selectedOrganization);
      }
    } catch (error) {
      handleError(error as Error);
    } finally {
      dispatch(actions.setPurchaseState(false));
    }
  };

  const beforePurchase = async () => {
    if (isRestrictedOrg) {
      openRestrictActionsModal();
      return;
    }
    triggerEvent({
      callback: checkOutModalEvent.userSubmitPaymentForm.bind(checkOutModalEvent) as () => void,
      params: eventParams,
    });
    dispatch(actions.setPurchaseState(true));
    await onCompletePurchase();
  };

  const canClaimTrial = () =>
    !isLowerPeriod() &&
    !isPremiumPersonalPlan() &&
    !isEmpty(targetPayment) &&
    (orgUtil.canStartTrialPlan(plan, targetPayment.trialInfo) as boolean);

  return {
    isProcessing,
    onClaim: beforePurchase,
    canClaimTrial: canClaimTrial(),
    trackUserFillPaymentForm,
  };
};

export default useClaimFreeTrial;
