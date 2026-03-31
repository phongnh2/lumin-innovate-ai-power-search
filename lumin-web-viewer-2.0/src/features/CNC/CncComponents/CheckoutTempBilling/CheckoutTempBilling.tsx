import { isNil, merge, throttle } from 'lodash';
import { Divider, Paper, Text, Button, PlainTooltip, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import React, { memo, useContext, useEffect } from 'react';
import { TFunction, Trans } from 'react-i18next';
import Linkify from 'react-linkify';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import BillingFeature from 'luminComponents/BillingFeature';
import { TempBillingSkeleton } from 'luminComponents/PaymentTempBilling/components';
import logOrgPlanChangedEvent from 'luminComponents/PaymentTempBilling/helpers/logOrgPlanChangedEvent';

import { PaymentInfoContext } from 'HOC/withGetPaymentInfo';

import {
  useTrackFormEvent,
  useRetrieveRemainingPlan,
  useUrlSearchParams,
  useMatchPaymentRoute,
  useTranslation,
  useCreateCredentials,
  useRestrictedUser,
  useClaimFreeTrial,
} from 'hooks';
import useOpenExtendFreeTrialModal from 'hooks/useOpenExtendFreeTrialModal';

import { loggerServices, organizationServices } from 'services';
import { ICreateOrganizationSubscriptionInput } from 'services/organizationServices';

import { paymentUtil, commonUtils } from 'utils';
import errorExtract from 'utils/error';
import PaymentEventCollection from 'utils/Factory/EventCollection/PaymentEventCollection';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useSendBeginCheckoutEvent, useSendPurchaseEvent } from 'features/CNC/hooks';
import { SummarizeErrorType } from 'features/DocumentSummarization/constants';

import { ErrorCode } from 'constants/errorCode';
import { ModalTypes } from 'constants/lumin-common';
import { ERROR_MESSAGE_CANNOT_CREATE_ANOTHER_SUBSCRIPTION, ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';
import { ORG_TEXT, ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PERIOD, PLAN_TYPE_LABEL, STATUS } from 'constants/plan';
import { PaymentPeriod, PaymentPlans, PaymentStatus } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IChargeData } from 'interfaces/payment/payment.interface';

import BillingDetails from './components/BillingDetails';
import BillingPlanInfo from './components/BillingPlanInfo';
import { getNextBillingDesc as getNextBillingDescription } from './helpers/getNextBillingDesc';
import { useGetCheckoutTempBilling } from './hooks/useGetCheckoutTempBilling';
import { BillingInfo } from '../OrganizationCheckout/OrganizationCheckoutContext';

import styles from './CheckoutTempBilling.module.scss';

const ExtendFreeTrialModal = lazyWithRetry(
  () => import(/* webpackPrefetch: true */ 'lumin-components/ExtendFreeTrialModal')
);

declare global {
  interface Window {
    twttr?: {
      conversion: {
        trackPid: (id: string, params: { tw_sale_amount: number; tw_order_quantity: number }) => void;
      };
    };
  }
}

const CONFIRM_PURCHASE_THROTTLING_TIME = 600;

const getErrorMessage = ({ t, orgName, metadata }: { t: TFunction; orgName: string; metadata: { plan: string } }) => ({
  [ErrorCode.Org.UPGRADING_INVOICE]: (
    <Trans
      i18nKey="modalChangingPlan.message"
      values={{ plan: metadata?.plan ? PLAN_TYPE_LABEL[metadata.plan as keyof typeof PLAN_TYPE_LABEL] : '' }}
    />
  ),
  [ErrorCode.Payment.CANNOT_CREATE_ANOTHER_SUBSCRIPTION]: t(ERROR_MESSAGE_CANNOT_CREATE_ANOTHER_SUBSCRIPTION),
  [ErrorCode.Org.ORG_ALREADY_CHARGED]: (
    <Trans
      i18nKey="modalUpdatePayment.reloadToHaveTheLatestSubscription"
      values={{ orgName }}
      components={{
        b: <b className={styles.boldText} />,
      }}
    />
  ),
  [ErrorCode.Payment.PAYMENT_INCOMPLETE]: (
    <Trans
      i18nKey="modalUpdatePayment.reloadToHaveTheLatestSubscription"
      values={{ orgName }}
      components={{
        b: <b className={styles.boldText} />,
      }}
    />
  ),
  [ErrorCode.Payment.CARD_DECLINED]: t('errorMessage.yourCardHasBeenDeclined'),
  [ErrorCode.Payment.EXPIRED_CARD]: t('errorMessage.yourCardHasExpired'),
  [ErrorCode.Payment.INCORRECT_CVC]: t('errorMessage.yourCardSecurityCodeIsIncorrect'),
});

const getErrorTitle = (t: TFunction) => ({
  [ErrorCode.Org.UPGRADING_INVOICE]: t('modalChangingPlan.title'),
  [ErrorCode.Payment.CANNOT_CREATE_ANOTHER_SUBSCRIPTION]: t('common.fail'),
  [ErrorCode.Org.ORG_ALREADY_CHARGED]: t('modalUpdatePayment.actionCannotBePerformed'),
  [ErrorCode.Payment.PAYMENT_INCOMPLETE]: t('modalUpdatePayment.actionCannotBePerformed'),
});

const confirmButtonProps = { withExpandedSpace: true };

type PaymentEventCallback =
  | typeof PaymentEventCollection.paymentError
  | typeof PaymentEventCollection.paymentSuccess
  | typeof PaymentEventCollection.userSubmitPaymentForm;

type Props = {
  billingInfo: BillingInfo;
  isChangeCard: boolean;
  canUpgrade: boolean;
  currentOrganization: IOrganization;
  isCardExisted: boolean;
  isLoading: boolean;
  isFetchedCard: boolean;
  clientId: string;
  getNewSecret: () => void;
};

function CheckoutTempBilling({
  billingInfo,
  clientId,
  currentOrganization,
  canUpgrade,
  isCardExisted,
  isChangeCard,
  isLoading,
  isFetchedCard,
  getNewSecret,
}: Props) {
  const { currency, isCardFilled, couponCode, quantity, stripeAccountId } = billingInfo;
  const { plan, period, trial } = useMatchPaymentRoute();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchParams = useUrlSearchParams();
  const { createCustomerCredentials } = useCreateCredentials();
  const state = store.getState();
  const isPurchasing = selectors.getPurchaseState(state);
  const {
    open: openExtendFreeTrialModal,
    onOpen: onOpenExtendFreeTrialModal,
    onClose: onCloseExtendFreeTrialModal,
  } = useOpenExtendFreeTrialModal();

  const {
    payment: orgPayment,
    name: orgName,
    _id: organizationId,
    hasPendingInvoice,
    docStackStorage: orgDocStack,
  } = currentOrganization;

  const isFreeTrial = trial === 'true';
  const continueUrl = searchParams.get(UrlSearchParam.CONTINUE_URL);
  const returnUrl = searchParams.get(UrlSearchParam.RETURN_URL);
  const fromParam = searchParams.get(UrlSearchParam.FROM);
  const isComeFromBlockedPrepaidCardOnTrial = fromParam === 'prepaid_card';
  const paymentSuccessfulRedirect = decodeURIComponent(
    searchParams.get(UrlSearchParam.PAYMENT_SUCCESSFUL_REDIRECT) || ''
  );
  const tempBillingText = useGetCheckoutTempBilling({
    currentOrganization,
    billingInfo,
    canUpgrade,
    isFreeTrial,
  });
  const { trackSubmitForm } = useTrackFormEvent();
  const { triggerEvent } = useContext(PaymentInfoContext);
  const { remaining, amountDue, nextBilling, total, discount, discountDescription } = useRetrieveRemainingPlan({
    billingInfo,
    canUpgrade,
    clientId,
    isFetchedCard,
  });

  const { disabled, loading, onClaim, canClaimTrial } = useClaimFreeTrial({
    onOpenExtendFreeTrialModal,
    from: Routers.CHECKOUT,
    refetchNewSecret: getNewSecret,
  });

  const isMonthly = period === PERIOD.MONTHLY;
  const { isDriveOnlyUser } = useRestrictedUser();
  const isDisabledButton =
    isLoading ||
    isPurchasing ||
    isDriveOnlyUser ||
    (!isCardFilled && !isCardExisted) ||
    !canUpgrade ||
    hasPendingInvoice;

  const { sendPurchaseEvent } = useSendPurchaseEvent();

  const isTrialing = () => orgPayment?.status === STATUS.TRIALING;

  useSendBeginCheckoutEvent({
    eventPlanName: tempBillingText.eventPlanName,
    amountDue: amountDue.toString(),
    period,
    currency,
    price: total,
    discount: discount.toString(),
    coupon: couponCode,
    organizationId,
  });

  async function getPaymentParams({ isUpgrading = false } = {}): Promise<string | unknown> {
    const useNewCard = isCardFilled && (!isCardExisted || isChangeCard);
    const params = {
      plan,
      period,
      ...(!isUpgrading && { currency }),
      couponCode,
      quantity,
    };
    const { issuedId } = useNewCard ? await createCustomerCredentials({ organizationId, stripeAccountId }) : {};
    if (isUpgrading) {
      const { totalBlock } = paymentUtil.getNextDocStack({
        quantity,
        nextPlan: plan as PaymentPlans,
        nextPeriod: period as PaymentPeriod,
        currentStatus: orgPayment.status as PaymentStatus,
        currentPeriod: orgPayment.period as PaymentPeriod,
        currentPlan: orgPayment.type,
        totalDocStackUsed: orgDocStack?.totalUsed || 0,
      });
      return {
        ...params,
        quantity: totalBlock,
        ...(issuedId && { sourceId: issuedId }),
        ...(isComeFromBlockedPrepaidCardOnTrial && { isBlockedPrepaidCardOnTrial: true }),
      };
    }
    return {
      ...params,
      ...(issuedId && { tokenId: issuedId }),
      ...(isComeFromBlockedPrepaidCardOnTrial && { isBlockedPrepaidCardOnTrial: true }),
      stripeAccountId,
    };
  }

  function getPaymentEventParams() {
    const { customerRemoteId } = orgPayment || {};
    return {
      freeTrialDays: isFreeTrial ? FREE_TRIAL_DAYS : 0,
      StripeCustomerId: customerRemoteId,
      organizationId,
    };
  }

  const getModalSetting = ({
    message,
    code,
    metadata,
    isSetupIntentError,
  }: {
    message: string;
    code: string;
    metadata: { plan: string };
    isSetupIntentError: boolean;
  }) => {
    const errorTitle = getErrorTitle(t)[code] || t('common.fail');
    const meessagesMapping = getErrorMessage({ t, orgName, metadata });
    const messages = meessagesMapping[code] || meessagesMapping[message] || message;
    const isUpgradingInvoiceError = code === ErrorCode.Org.UPGRADING_INVOICE;
    const isShowOkButton = isSetupIntentError || isUpgradingInvoiceError;
    const modalSetting = {
      type: isUpgradingInvoiceError ? ModalTypes.WARNING : ModalTypes.ERROR,
      title: errorTitle,
      message: <Linkify>{messages}</Linkify>,
      confirmButtonTitle: isShowOkButton ? t('common.ok') : t('common.reload'),
      useReskinModal: true,
      confirmButtonProps: isShowOkButton ? confirmButtonProps : {},
      closeOnRouteChange: true,
      onConfirm: () => {},
    };

    if (!isShowOkButton) {
      modalSetting.onConfirm = () => window.location.reload();
    }

    return modalSetting;
  };

  function _handleError(error: Error) {
    const { message, code, metadata, isSetupIntentError } = errorExtract.extractGqlError(error) as {
      message: string;
      code: SummarizeErrorType;
      metadata: { plan: string };
      isSetupIntentError: boolean;
    };
    const modalSetting = getModalSetting({ message, code, metadata, isSetupIntentError });
    try {
      JSON.parse(message);
      loggerServices.error({ errorMessage: `PaymentError: ${message as unknown as string}` });
    } catch {
      triggerEvent({
        callback: PaymentEventCollection.paymentError.bind(PaymentEventCollection) as PaymentEventCallback,
        params: { ...getPaymentEventParams(), errorMessage: message },
      });
    }
    dispatch(actions.openModal(modalSetting));
  }

  function getTotalPrice(): number {
    if (isFreeTrial) {
      return 0;
    }
    return canUpgrade ? amountDue : 0;
  }

  const handleTrackPurchaseEvent = ({
    paymentData,
    currentOrg,
  }: {
    paymentData: IChargeData;
    currentOrg: IOrganization;
  }) => {
    sendPurchaseEvent({
      subscriptionRemoteId: paymentData.subscriptionRemoteId,
      currency: paymentData.currency,
      organization: currentOrg,
      value: getTotalPrice(),
      price: total,
      discount,
      coupon: couponCode,
    });
  };
  function tracking({ paymentData, currentOrg }: { paymentData: IChargeData; currentOrg: IOrganization }) {
    if (window.twttr) {
      window.twttr.conversion.trackPid('o4g6n', { tw_sale_amount: 0, tw_order_quantity: 0 });
    }

    handleTrackPurchaseEvent({ paymentData, currentOrg });
    triggerEvent({
      callback: PaymentEventCollection.paymentSuccess.bind(PaymentEventCollection) as PaymentEventCallback,
      params: {
        value: getTotalPrice(),
        currency: paymentData.currency,
        ...getPaymentEventParams(),
        StripeCustomerId: paymentData.customerRemoteId,
        subscriptionRemoteId: paymentData.subscriptionRemoteId,
        planRemoteId: paymentData.planRemoteId,
      },
    });
  }

  async function chargeNewSubscription(): Promise<{
    paymentData: IChargeData;
    organization: IOrganization;
  }> {
    const payload = (await getPaymentParams()) as ICreateOrganizationSubscriptionInput;
    const createdData = await organizationServices.createOrganizationSubscription(currentOrganization._id, payload);
    return {
      paymentData: createdData,
      organization: currentOrganization,
    };
  }

  function handleOnConfirmModal(organization: IOrganization) {
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
      })
    );
    dispatch(actions.updateOrganizationInList(organization._id, organization));
    dispatch(actions.closeModal());
    navigate(
      paymentSuccessfulRedirect ||
        returnUrl ||
        `/${ORG_TEXT}/${organization.url}/documents` ||
        continueUrl ||
        Routers.PERSONAL_DOCUMENT
    );
  }

  const handleChargeSubscription = async (): Promise<{
    paymentData: IChargeData;
    organization: IOrganization;
  }> => {
    if (tempBillingText.isNewSubscription) {
      const { paymentData: newSubscriptionPaymentData, organization } = await chargeNewSubscription();
      return {
        paymentData: newSubscriptionPaymentData,
        organization,
      };
    }
    const payload = (await getPaymentParams({ isUpgrading: true })) as ICreateOrganizationSubscriptionInput;
    const paymentData = await organizationServices.upgradeOrganizationSubcription(currentOrganization._id, payload);
    return {
      paymentData,
      organization: currentOrganization,
    };
  };

  const handleOpenSuccessModal = (organization: IOrganization) => {
    const {
      docStackStorage,
      url,
      payment: { type },
    } = organization;
    const message = (
      <Trans
        i18nKey="payment.orgHasDocuments"
        values={{ orgName: organization.name, totalStack: docStackStorage.totalStack }}
        components={{
          b: <b className={styles.boldText} />,
          br: <br />,
          a: (
            // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
            <a
              href={`/${ORG_TEXT}/${url}/dashboard/billing`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.boldText}
              style={{
                textDecoration: 'underline',
              }}
            />
          ),
        }}
      />
    );
    dispatch(
      actions.openModal({
        type: ModalTypes.TADA,
        title: t('payment.planSubscriptionActivated', {
          planName: PLAN_TYPE_LABEL[type as keyof typeof PLAN_TYPE_LABEL],
        }),
        message,
        confirmButtonTitle: t('common.ok'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        onConfirm: () => handleOnConfirmModal(organization),
        titleCentered: true,
        useReskinModal: true,
        confirmButtonProps,
        closeOnRouteChange: true,
      })
    );
  };

  const getUpdatedOrgData = (organization: IOrganization, paymentData: IChargeData): IOrganization => {
    const calcNextStackPayload = {
      quantity,
      nextPlan: plan as PaymentPlans,
      nextPeriod: period as PaymentPeriod,
      currentStatus: organization.payment.status as PaymentStatus,
      currentPeriod: organization.payment.period as PaymentPeriod,
      currentPlan: organization.payment.type,
      totalDocStackUsed: organization.docStackStorage?.totalUsed || 0,
    };
    const { nextDocStack } = paymentUtil.getNextDocStack(calcNextStackPayload);
    const { autoUpgrade: prevAutoUpgrade } = organization.settings;
    return {
      ...organization,
      payment: merge({}, organization.payment, paymentData),
      settings: {
        ...organization.settings,
        autoUpgrade: isNil(prevAutoUpgrade) ? true : prevAutoUpgrade,
      },
      docStackStorage: {
        ...organization.docStackStorage,
        totalStack: nextDocStack,
      },
    };
  };

  const _onCompletePurchase = async (e: React.MouseEvent) => {
    if (e) {
      trackSubmitForm(e);
    }
    dispatch(actions.setPurchaseState(true));
    triggerEvent({
      callback: PaymentEventCollection.userSubmitPaymentForm.bind(PaymentEventCollection) as PaymentEventCallback,
      params: getPaymentEventParams(),
    });
    try {
      const { organization, paymentData } = await handleChargeSubscription();
      const updatedOrg = getUpdatedOrgData(organization, paymentData);
      logOrgPlanChangedEvent({
        orgId: updatedOrg._id,
        previousPayment: currentOrganization?.payment,
        newPayment: updatedOrg?.payment,
        previousDocStackStorage: organization.docStackStorage,
        newDocStackStorage: updatedOrg.docStackStorage,
      });
      tracking({ paymentData, currentOrg: updatedOrg });

      const userIsMemberInOrg = updatedOrg.userRole.toUpperCase() === ORGANIZATION_ROLES.MEMBER;
      const payload = userIsMemberInOrg
        ? {
            payment: paymentData,
            userRole: ORGANIZATION_ROLES.BILLING_MODERATOR.toLocaleLowerCase(),
          }
        : {
            payment: paymentData,
          };
      dispatch(actions.updateOrganizationInList(updatedOrg._id, payload));
      handleOpenSuccessModal(updatedOrg);
    } catch (error) {
      _handleError(error as Error);
    } finally {
      dispatch(actions.setPurchaseState(false));
    }
  };

  const _handleConfirmPurchaseModal = async (e: React.MouseEvent) => {
    await _onCompletePurchase(e);
  };

  function getTextPeriod() {
    return period.toUpperCase() === PERIOD.ANNUAL ? t('common.annualPlan') : t('common.monthlyPlan');
  }

  function renderTooltipContent() {
    return (
      (hasPendingInvoice && t('payment.cannotChangeCurrentPlan')) ||
      (isDriveOnlyUser && ERROR_MESSAGE_RESTRICTED_ACTION) ||
      (!canUpgrade && t('payment.yourOrgCannotStartThisPlan'))
    );
  }

  const showNextBillingDesc =
    canUpgrade && !nextBilling.loading && nextBilling.time && typeof nextBilling.price === 'number';
  const showCreditBalanceDesc = showNextBillingDesc && nextBilling.creditBalance;
  useEffect(() => {
    if (!canUpgrade && continueUrl) {
      navigate(decodeURIComponent(continueUrl), { replace: true });
    }
  }, [canUpgrade, continueUrl, navigate]);

  const renderNextBillingDesc = () =>
    getNextBillingDescription({
      isFreeTrial,
      isMonthly,
      period: period as PaymentPeriod,
      plan: plan as PaymentPlans,
      showCreditBalanceDesc: Boolean(showCreditBalanceDesc),
      canClaimTrial,
      nextBilling: {
        creditBalance: nextBilling.creditBalance,
        price: nextBilling.price,
        time: Number(nextBilling.time),
      },
      tempBillingText,
    });

  const getButton = () => {
    if (isFreeTrial) {
      return (
        <Button size="lg" fullWidth disabled={disabled || !canClaimTrial} loading={loading} onClick={onClaim}>
          {t('freeTrialPage.claimMyFreeTrial')}
        </Button>
      );
    }
    return (
      <Button
        size="lg"
        fullWidth
        disabled={isDisabledButton || nextBilling.loading}
        loading={isPurchasing}
        onClick={throttle(_handleConfirmPurchaseModal, CONFIRM_PURCHASE_THROTTLING_TIME, { trailing: false })}
      >
        {commonUtils.formatTitleCaseByLocale(t('modalConfirmInformation.confirmButtonTitle'))}
      </Button>
    );
  };

  return (
    <div className={styles.container}>
      <Paper shadow="sm" radius="md" className={styles.billingContainer}>
        <div className={styles.header}>
          <Text component="h2" type="headline" size="lg" color="var(--kiwi-colors-core-on-primary)">
            {t('common.summary')}
          </Text>
        </div>
        <div className={styles.body}>
          <div className={styles.planInfo}>
            <BillingPlanInfo
              tempBillingText={tempBillingText}
              showNextBillingDesc={showNextBillingDesc}
              renderNextBillingDesc={renderNextBillingDesc}
              isTrialing={isTrialing}
              nextBilling={nextBilling}
            />
          </div>
          <Divider />
          <div className={styles.billing}>
            {nextBilling.loading ? (
              <TempBillingSkeleton />
            ) : (
              <BillingDetails
                isFreeTrial={isFreeTrial}
                textPeriod={getTextPeriod()}
                discountDescription={discountDescription}
                tempBillingText={tempBillingText}
                canUpgrade={canUpgrade}
                total={total}
                remaining={remaining}
                discount={discount}
                totalPrice={getTotalPrice()}
              />
            )}
            {isFreeTrial && (
              <div className={styles.trialFeature}>
                <div className={styles.trialFeatureItem}>
                  <KiwiIcomoon type="checkbox-md" size="md" />
                  <Text type="body" size="sm">
                    {t('freeTrialPage.discriptionTempBilling')}
                  </Text>
                </div>
                <div className={styles.trialFeatureItem}>
                  <KiwiIcomoon type="checkbox-md" size="md" />
                  <Text type="body" size="sm">
                    {t('freeTrialPage.discriptionTempBilling1')}
                  </Text>
                </div>
              </div>
            )}
            <PlainTooltip maw={388} content={renderTooltipContent()}>
              {getButton()}
            </PlainTooltip>
          </div>
        </div>
        {openExtendFreeTrialModal && <ExtendFreeTrialModal onClose={onCloseExtendFreeTrialModal} />}
      </Paper>
      <BillingFeature plan={plan} />
    </div>
  );
}

export default memo(CheckoutTempBilling);
