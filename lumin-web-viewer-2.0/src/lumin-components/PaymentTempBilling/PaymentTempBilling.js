/* eslint-disable no-nested-ternary */
import { capitalize, isNil, merge, throttle } from 'lodash';
import { Divider, Paper, Text, Button, PlainTooltip, Icomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { memo, useContext, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import Linkify from 'react-linkify';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import ButtonMaterial, { ButtonColor, ButtonSize } from 'lumin-components/ButtonMaterial';
import Tooltip from 'lumin-components/Shared/Tooltip';
import TempBillingDivider from 'lumin-components/TempBillingDivider';
import BillingFeature from 'luminComponents/BillingFeature';

import { PaymentInfoContext } from 'HOC/withGetPaymentInfo';
import { WarningBannerContext } from 'src/HOC/withWarningBanner';

import {
  useTrackFormEvent,
  useRetrieveRemainingPlan,
  useUrlSearchParams,
  useMatchPaymentRoute,
  useTranslation,
  useAvailablePersonalWorkspace,
  useCreateCredentials,
  useRestrictedUser,
  useEnableWebReskin,
} from 'hooks';
import useReactivateAccount from 'hooks/useReactivateAccount';
import useRestrictBillingActions from 'hooks/useRestrictBillingActions';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { dateUtil as dateUtils, paymentUtil, orgUtil, commonUtils, numberUtils } from 'utils';
import errorExtract from 'utils/error';
import paymentEvent from 'utils/Factory/EventCollection/PaymentEventCollection';
import { lazyWithRetry } from 'utils/lazyWithRetry';
import { isUserInNewAuthenTestingScope } from 'utils/newAuthenTesting';
import validators from 'utils/validator';

import { useSendBeginCheckoutEvent, useSendPurchaseEvent } from 'features/CNC/hooks';

import { WarningBannerType } from 'constants/banner';
import { ErrorCode } from 'constants/errorCode';
import { LocalStorageKey } from 'constants/localStorageKey';
import { ModalTypes } from 'constants/lumin-common';
import {
  MESSAGE_MIGRATE_TEAM_PAYMENT,
  ERROR_MESSAGE_CANNOT_CREATE_ANOTHER_SUBSCRIPTION,
  ERROR_MESSAGE_RESTRICTED_ACTION,
} from 'constants/messages';
import { ORG_SET_UP_TYPE, ORG_TEXT, ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PERIOD, PLAN_TYPE_LABEL, PaymentTypes, Plans, STATUS } from 'constants/plan';
import { Routers, NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';
import { Colors } from 'constants/styles';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { TempBillingSkeleton, TempBillingDescSkeleton } from './components';
import logOrgPlanChangedEvent from './helpers/logOrgPlanChangedEvent';
import { useGetTempBilling } from './hooks/useGetTempBilling';

import * as Styled from './PaymentTempBilling.styled';

import styles from './PaymentTempBilling.module.scss';

const ModalConfirmInformation = lazyWithRetry(() => import('./components/ModalConfirmInformation'));

const CONFIRM_PURCHASE_THROTTLING_TIME = 600;

export const getErrorMessage = ({ t, orgName, metadata }) => ({
  [ErrorCode.Org.UPGRADING_INVOICE]: (
    <Trans i18nKey="modalChangingPlan.message" values={{ plan: PLAN_TYPE_LABEL[metadata?.plan] }} />
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

export const getErrorTitle = (t) => ({
  [ErrorCode.Org.UPGRADING_INVOICE]: t('modalChangingPlan.title'),
  [ErrorCode.Payment.CANNOT_CREATE_ANOTHER_SUBSCRIPTION]: t('common.fail'),
  [ErrorCode.Org.ORG_ALREADY_CHARGED]: t('modalUpdatePayment.actionCannotBePerformed'),
  [ErrorCode.Payment.PAYMENT_INCOMPLETE]: t('modalUpdatePayment.actionCannotBePerformed'),
});

const confirmButtonProps = {
  withExpandedSpace: true,
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function PaymentTempBilling({
  billingInfo,
  currentUser,
  openModal,
  isPurchasing,
  setPurchaseState,
  clientId,
  currentOrganization,
  canUpgrade,
  updateOrganizationInList,
  isCardExisted,
  isChangeCard,
  isLoading,
  updateModalProperties,
  newOrganization,
  changeBillingInfo,
  setOrganizations,
  isFetchedCard,
}) {
  const { currency, isCardFilled, couponCode, quantity, stripeAccountId } = billingInfo;
  const { plan, period, isFreeTrial } = useMatchPaymentRoute();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();
  const { fromSetupOrg } = state || {};
  const searchParams = useUrlSearchParams();
  const { createCustomerCredentials } = useCreateCredentials();
  const { isEnableReskin } = useEnableWebReskin();

  const isOldPlan = plan === Plans.BUSINESS;
  const {
    convertFromTeam: isConvertFromTeam,
    payment: orgPayment,
    name: orgName,
    userRole,
    _id: organizationId,
    hasPendingInvoice,
  } = currentOrganization || {};
  const { docStackStorage: orgDocStack = {} } = currentOrganization || {};
  const continueUrl = searchParams.get(UrlSearchParam.CONTINUE_URL);
  const returnUrl = searchParams.get(UrlSearchParam.RETURN_URL);
  const fromParam = searchParams.get(UrlSearchParam.FROM);
  const isComeFromBlockedPrepaidCardOnTrial = fromParam === 'prepaid_card';
  const paymentSuccessfulRedirect = decodeURIComponent(
    searchParams.get(UrlSearchParam.PAYMENT_SUCCESSFUL_REDIRECT) || ''
  );
  const tempBillingText = useGetTempBilling({
    currentOrganization,
    billingInfo,
    canUpgrade,
  });
  const { trackSubmitForm } = useTrackFormEvent();
  const { triggerEvent } = useContext(PaymentInfoContext);
  const { remaining, amountDue, nextBilling, total, discount, discountDescription } = useRetrieveRemainingPlan({
    billingInfo,
    canUpgrade,
    clientId,
    isFetchedCard,
  });

  const isMonthly = period === PERIOD.MONTHLY;
  const bannerContextValue = useContext(WarningBannerContext);
  const { refetch: refetchBillingWarning } = bannerContextValue[WarningBannerType.BILLING_WARNING.value];
  const hasJoinedAnyOrgs = useSelector(selectors.hasJoinedAnyOrganizations);
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);
  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual).data || [];
  const isOrgNameError = !availablePaidOrgs.length && Boolean(newOrganization.error);
  const { isOrgCreationRestricted } = useRestrictedUser();
  const isPreventCreateOrg = isOrgCreationRestricted && !availablePaidOrgs.length;
  const isDisabledButton =
    isLoading ||
    isPurchasing ||
    isPreventCreateOrg ||
    (!isCardFilled && !isCardExisted) ||
    !canUpgrade ||
    (!availablePaidOrgs.length && isOrgNameError) ||
    hasPendingInvoice;
  const [isOpenInformationModal, setIsOpenInformationModal] = useState(false);
  const [informationModalSetting, setInformationModalSetting] = useState({});

  const isProfessionalUser = useAvailablePersonalWorkspace();

  const { sendPurchaseEvent } = useSendPurchaseEvent();

  const { isRestrictedOrg, openRestrictActionsModal } = useRestrictBillingActions({
    orgId: currentOrganization?._id,
  });

  const isTrialing = () => orgPayment?.status === STATUS.TRIALING;

  useSendBeginCheckoutEvent({
    eventPlanName: tempBillingText.eventPlanName,
    amountDue,
    period,
    currency,
    price: total,
    discount,
    coupon: couponCode,
    organizationId,
  });

  async function getPaymentParams({ isUpgrading = false } = {}) {
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
      if (isOldPlan) {
        return {
          ...params,
          quantity,
          ...(issuedId && { sourceId: issuedId }),
        };
      }
      const { totalBlock } = paymentUtil.getNextDocStack({
        quantity,
        nextPlan: plan,
        nextPeriod: period,
        currentStatus: orgPayment.status,
        currentPeriod: orgPayment.period,
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

  const getModalSetting = ({ message, code, metadata, isSetupIntentError }) => {
    const errorTitle = getErrorTitle(t)[code] || t('common.fail');
    const meessagesMapping = getErrorMessage({ t, orgName, metadata });
    const messages = meessagesMapping[code] || meessagesMapping[message] || message;
    const isUpgradingInvoiceError = code === ErrorCode.Org.UPGRADING_INVOICE;
    const isShowOkButton = isSetupIntentError || isUpgradingInvoiceError;
    const modalSetting = {
      type: isUpgradingInvoiceError ? ModalTypes.WARNING : ModalTypes.ERROR,
      title: errorTitle,
      message: <Linkify properties={{ target: '_blank' }}>{messages}</Linkify>,
      confirmButtonTitle: isShowOkButton ? t('common.ok') : t('common.reload'),
      useReskinModal: true,
      closeOnRouteChange: true,
      confirmButtonProps: isShowOkButton ? confirmButtonProps : {},
    };

    if (!isShowOkButton) {
      modalSetting.onConfirm = () => window.location.reload();
    }

    return modalSetting;
  };

  function _handleError(error) {
    const { message, code, metadata, isSetupIntentError } = errorExtract.extractGqlError(error);
    const modalSetting = getModalSetting({ message, code, metadata, isSetupIntentError });
    try {
      JSON.parse(message);
      logger.logError({ message: `PaymentError: ${message}` });
    } catch {
      triggerEvent({
        callback: paymentEvent.paymentError.bind(paymentEvent),
        params: { ...getPaymentEventParams(), errorMessage: message },
      });
    }
    openModal(modalSetting);
  }

  const handleTrackPurchaseEvent = ({ paymentData, currentOrg }) => {
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

  function tracking({ paymentData, currentOrg }) {
    if (window.twttr) {
      window.twttr.conversion.trackPid('o4g6n', { tw_sale_amount: 0, tw_order_quantity: 0 });
    }

    handleTrackPurchaseEvent({ paymentData, currentOrg });
    triggerEvent({
      callback: paymentEvent.paymentSuccess.bind(paymentEvent),
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

  async function createNewOrg() {
    const isEducation = validators.validateDomainEducation(currentUser.email);
    const { organization } = await organizationServices.createOrganization({
      organizationData: {
        name: newOrganization.name,
        purpose: isEducation ? ORG_SET_UP_TYPE.EDUCATION : ORG_SET_UP_TYPE.WORK,
      },
    });
    return organization;
  }

  async function chargeNewSubscription() {
    const payload = await getPaymentParams();
    if (availablePaidOrgs.length) {
      const createdData = await organizationServices.createOrganizationSubscription(currentOrganization._id, payload);
      return {
        paymentData: createdData,
        organization: currentOrganization,
      };
    }
    const organization = await createNewOrg();
    const createdData = await organizationServices.createOrganizationSubscription(organization._id, payload);
    const organizationWithRole = orgUtil.mappingOrgWithRoleAndTeams(organization);
    setOrganizations([...organizationList, organizationWithRole]);
    dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: organization.url }));
    localStorage.setItem(LocalStorageKey.HAS_CREATED_ORGANIZATION_ON_PAYMENT_PAGE, 'true');
    return {
      paymentData: createdData,
      organization,
    };
  }

  async function handleOnConfirmModal(organization) {
    const isOnCreateNewOrgFlow = !hasJoinedAnyOrgs && organization;
    updateModalProperties({
      isProcessing: true,
    });
    updateOrganizationInList(organization._id, organization);
    dispatch(actions.closeModal());
    // if create org => push to setup-circle
    if ((isUserInNewAuthenTestingScope(currentUser) && isOnCreateNewOrgFlow) || fromSetupOrg) {
      navigate(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION, {
        state: {
          createdOrg: organization,
          fromPayment: true,
        },
      });
    } else {
      navigate(
        paymentSuccessfulRedirect ||
          returnUrl ||
          `/${ORG_TEXT}/${organization.url}/documents` ||
          continueUrl ||
          Routers.PERSONAL_DOCUMENT
      );
    }
  }

  const handleChargeSubscription = async () => {
    if (tempBillingText.isNewSubscription) {
      const { paymentData: newSubscriptionPaymentData, organization } = await chargeNewSubscription();
      refetchBillingWarning(clientId, PaymentTypes.ORGANIZATION);
      return {
        paymentData: newSubscriptionPaymentData,
        organization,
      };
    }
    const payload = await getPaymentParams({ isUpgrading: true });
    const paymentData = await organizationServices.upgradeOrganizationSubcription(currentOrganization._id, payload);
    refetchBillingWarning(clientId, PaymentTypes.ORGANIZATION);
    return {
      paymentData,
      organization: currentOrganization,
    };
  };

  const handleOpenSuccessModal = (organization) => {
    const {
      docStackStorage,
      url,
      payment: { type },
    } = organization;
    let message = '';
    if (isOldPlan) {
      message = (
        <>
          {t('payment.thankYouForYourPayment')}
          <br />
          {t('payment.youCanUpMember', { quantity })}
          {isMonthly && `\u00a0${t('payment.nextBillingCycle')}`}
        </>
      );
    } else {
      message = (
        <Trans
          i18nKey="payment.orgHasDocuments"
          values={{ orgName: organization.name, totalStack: docStackStorage.totalStack }}
          components={{
            b: (
              <b
                style={{
                  color: isEnableReskin ? 'var(--kiwi-colors-surface-on-surface)' : Colors.NEUTRAL_100,
                  fontWeight: 700,
                }}
              />
            ),
            br: <br />,
            a: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
              <a
                href={`/${ORG_TEXT}/${url}/dashboard/billing`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontWeight: 600,
                  ...(isEnableReskin && {
                    fontWeight: 700,
                    color: 'var(--kiwi-colors-surface-on-surface)',
                    textDecoration: 'underline',
                  }),
                }}
              />
            ),
          }}
        />
      );
    }

    openModal({
      type: ModalTypes.TADA,
      title: isOldPlan
        ? t('payment.upgradeSuccessful')
        : t('payment.planSubscriptionActivated', { planName: PLAN_TYPE_LABEL[type] }),
      message,
      confirmButtonTitle: t('common.ok'),
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      onConfirm: () => handleOnConfirmModal(organization),
      titleCentered: true,
      useReskinModal: true,
      closeOnRouteChange: true,
      confirmButtonProps,
    });
  };

  const getUpdatedOrgData = (organization, paymentData) => {
    if (isOldPlan) {
      return {
        ...organization,
        payment: merge({}, organization.payment, paymentData),
      };
    }
    const calcNextStackPayload = {
      quantity,
      nextPlan: plan,
      nextPeriod: period,
      currentStatus: organization.payment.status,
      currentPeriod: organization.payment.period,
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

  const _onCompletePurchase = async (e) => {
    // track form event
    if (e) {
      trackSubmitForm(e);
    }
    setPurchaseState(true);
    triggerEvent({
      callback: paymentEvent.userSubmitPaymentForm.bind(paymentEvent),
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
      handleOpenSuccessModal(updatedOrg);
      if (!hasJoinedAnyOrgs) {
        changeBillingInfo('organizationId', updatedOrg._id);
      }
    } catch (error) {
      _handleError(error);
    } finally {
      setPurchaseState(false);
    }
  };

  const openInformationModal = () => {
    const modalSettings = {
      userRole: !availablePaidOrgs.length ? ORGANIZATION_ROLES.ORGANIZATION_ADMIN.toLowerCase() : userRole,
      onConfirm: () => {
        setIsOpenInformationModal(false);
        _onCompletePurchase();
      },
      onCancel: () => {
        setIsOpenInformationModal(false);
      },
      currencySymbol: tempBillingText.currencySymbol,
      creditBalance: nextBilling.creditBalance || 0,
    };
    setInformationModalSetting(modalSettings);
    setIsOpenInformationModal(true);
  };

  const { openReactivateModal } = useReactivateAccount({
    organization: currentOrganization,
    handleAfterReactivate: currentUser.deletedAt && !isProfessionalUser ? _onCompletePurchase : openInformationModal,
    handleAfterCancelReactivate: () => setPurchaseState(false),
  });

  const _handleConfirmPurchaseModal = async (e) => {
    if (currentUser.deletedAt) {
      openReactivateModal();
      return;
    }
    if (isRestrictedOrg) {
      openRestrictActionsModal();
      return;
    }
    if (isProfessionalUser) {
      openInformationModal();
    } else {
      _onCompletePurchase(e);
    }
  };

  function getTotalPrice() {
    return canUpgrade ? amountDue : 0;
  }

  function getTextPeriod() {
    return period.toUpperCase() === PERIOD.ANNUAL ? t('common.annualPlan') : t('common.monthlyPlan');
  }

  function renderTooltipContent() {
    return (
      (hasPendingInvoice && t('payment.cannotChangeCurrentPlan')) ||
      (isPreventCreateOrg && ERROR_MESSAGE_RESTRICTED_ACTION) ||
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

  const getNextBillingDesc = () => (
    <>
      <Trans
        i18nKey="payment.infoNextBillingCycle"
        components={{ b: <b /> }}
        values={{
          currencySymbol: tempBillingText.currencySymbol,
          price: numberUtils.formatDecimal(nextBilling.price),
          time: dateUtils.formatMDYTime(Number(nextBilling.time)),
        }}
      />
      {Boolean(showCreditBalanceDesc) && (
        <Trans
          i18nKey="payment.infoUnusedPreviousPlan"
          components={{ b: <b /> }}
          values={{
            currencySymbol: tempBillingText.currencySymbol,
            creditBalance: nextBilling.creditBalance,
          }}
        />
      )}
    </>
  );

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <Paper shadow="sm" radius="md" className={styles.billingContainer}>
          <div className={styles.header}>
            <Text component="h2" type="headline" size="md">
              {t('common.billing')}
            </Text>
          </div>
          <div className={styles.body}>
            <div className={styles.planInfo}>
              {nextBilling.loading ? (
                <TempBillingDescSkeleton />
              ) : (
                <>
                  <Text type="headline" size="md">
                    {capitalize(tempBillingText.planName)}
                  </Text>
                  {tempBillingText.chooseOrgText && (
                    <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                      {tempBillingText.chooseOrgText}
                    </Text>
                  )}
                  {tempBillingText.orgPriceText && (
                    <Text type="headline" size="sm" color="var(--kiwi-colors-core-primary)">
                      {tempBillingText.orgPriceText}
                    </Text>
                  )}
                  {tempBillingText.changeOrgPlanText && (
                    <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                      {tempBillingText.changeOrgPlanText}
                    </Text>
                  )}
                  {showNextBillingDesc && (
                    <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                      {getNextBillingDesc()}
                    </Text>
                  )}
                  {isTrialing() && (
                    <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
                      {t('payment.orgTrialDesc')}
                    </Text>
                  )}
                </>
              )}
            </div>
            <Divider />
            <div className={styles.billing}>
              {nextBilling.loading ? (
                <TempBillingSkeleton />
              ) : (
                <div className={styles.ammount}>
                  <div className={styles.row}>
                    <Text type="title" size="sm">
                      {nextBilling.isUpgradeDocStackAnnual ? t('payment.remainingNewPlan') : getTextPeriod()}
                      {Boolean(discountDescription) &&
                        nextBilling.isUpgradeDocStackAnnual &&
                        t('payment.discountPeriodPlan', { discount: discountDescription })}
                    </Text>
                    <Text type="headline" size="xs">
                      {tempBillingText.currencySymbol}
                      {canUpgrade ? numberUtils.formatDecimal(total) : 0}
                    </Text>
                  </div>
                  {Boolean(remaining) && canUpgrade && (
                    <div className={styles.row}>
                      <Text type="title" size="sm">
                        {t('payment.unusedTimeOnPreviousPlan')}
                      </Text>
                      <Text type="headline" size="xs">
                        -{tempBillingText.currencySymbol}
                        {numberUtils.formatTwoDigitsDecimal(remaining)}
                      </Text>
                    </div>
                  )}
                  {Boolean(discount) && (
                    <div className={styles.row}>
                      <Text type="title" size="sm">
                        {t('payment.promotionCode1')}
                      </Text>
                      <Text type="headline" size="xs">
                        -{tempBillingText.currencySymbol}
                        {numberUtils.formatTwoDigitsDecimal(discount)}
                      </Text>
                    </div>
                  )}
                  <div className={styles.row}>
                    <Text type="headline" size="sm">
                      {t('payment.amountDueToday')}
                    </Text>
                    <Text type="headline" size="lg" className={styles.bold} data-cy="amount-due-today">
                      {tempBillingText.currencySymbol}
                      {numberUtils.formatTwoDigitsDecimal(getTotalPrice())}
                    </Text>
                  </div>
                </div>
              )}

              {isConvertFromTeam && (
                <div className={styles.migrationTeamPayment}>
                  <Icomoon type="info-circle-filled" size="lg" color="var(--kiwi-colors-semantic-error)" />
                  <Text type="body" size="md" color="var(--kiwi-colors-semantic-on-error-container)">
                    {t(MESSAGE_MIGRATE_TEAM_PAYMENT.key)}
                  </Text>
                </div>
              )}

              <PlainTooltip maw={388} content={renderTooltipContent()}>
                <Button
                  size="lg"
                  fullWidth
                  disabled={isDisabledButton || nextBilling.loading}
                  loading={isPurchasing}
                  onClick={throttle(_handleConfirmPurchaseModal, CONFIRM_PURCHASE_THROTTLING_TIME, { trailing: false })}
                >
                  {commonUtils.formatTitleCaseByLocale(t('payment.completePurchase'))}
                </Button>
              </PlainTooltip>
            </div>
          </div>
          {isOpenInformationModal && <ModalConfirmInformation {...informationModalSetting} />}
        </Paper>
        <BillingFeature plan={plan} />
      </div>
    );
  }

  return (
    <div>
      <Styled.Container>
        <Styled.InfoContainer>
          <Styled.Title>{t('common.billing')}</Styled.Title>
          {nextBilling.loading ? (
            <Styled.InfoWrapper>
              <TempBillingDescSkeleton />
            </Styled.InfoWrapper>
          ) : (
            <Styled.InfoWrapper>
              <Styled.Text>{tempBillingText.planName}</Styled.Text>
              {tempBillingText.chooseOrgText && <Styled.TextInfo>{tempBillingText.chooseOrgText}</Styled.TextInfo>}
              {tempBillingText.orgPriceText && (
                <Styled.TextUnitPrice>{tempBillingText.orgPriceText}</Styled.TextUnitPrice>
              )}
              {tempBillingText.changeOrgPlanText && (
                <Styled.TextInfo>{tempBillingText.changeOrgPlanText}</Styled.TextInfo>
              )}
              {showNextBillingDesc && <Styled.TextInfo secondary>{getNextBillingDesc()}</Styled.TextInfo>}
              {isTrialing() && <Styled.TextInfo>{t('payment.orgTrialDesc')}</Styled.TextInfo>}
            </Styled.InfoWrapper>
          )}
        </Styled.InfoContainer>

        <TempBillingDivider />

        <Styled.Bill>
          {nextBilling.loading ? (
            <TempBillingSkeleton />
          ) : (
            <>
              <Styled.BillRow>
                <Styled.TextBill>
                  {nextBilling.isUpgradeDocStackAnnual ? t('payment.remainingNewPlan') : getTextPeriod()}
                  {Boolean(discountDescription) &&
                    nextBilling.isUpgradeDocStackAnnual &&
                    t('payment.discountPeriodPlan', { discount: discountDescription })}
                </Styled.TextBill>
                <Styled.TextBill>
                  {tempBillingText.currencySymbol}
                  {canUpgrade ? numberUtils.formatDecimal(total) : 0}
                </Styled.TextBill>
              </Styled.BillRow>
              {Boolean(remaining) && canUpgrade && (
                <Styled.BillRowSecondary>
                  <Styled.TextBill>{t('payment.unusedTimeOnPreviousPlan')}</Styled.TextBill>
                  <Styled.TextBill>
                    -{tempBillingText.currencySymbol}
                    {numberUtils.formatTwoDigitsDecimal(remaining)}
                  </Styled.TextBill>
                </Styled.BillRowSecondary>
              )}
              {Boolean(discount) && (
                <Styled.BillRowSecondary>
                  <Styled.TextBill>{t('payment.promotionCode1')}</Styled.TextBill>
                  <Styled.TextBill>
                    -{tempBillingText.currencySymbol}
                    {numberUtils.formatTwoDigitsDecimal(discount)}
                  </Styled.TextBill>
                </Styled.BillRowSecondary>
              )}

              <Styled.BillRow style={{ margin: 0 }}>
                <Styled.TextTotal>{t('payment.amountDueToday')}</Styled.TextTotal>
                <Styled.TextTotal>
                  {tempBillingText.currencySymbol}
                  {numberUtils.formatTwoDigitsDecimal(getTotalPrice())}
                </Styled.TextTotal>
              </Styled.BillRow>
              {isConvertFromTeam && (
                <Styled.MigrationDiscount>
                  <Styled.Message iconSize={20} iconColor={Colors.SECONDARY_50}>
                    {t(MESSAGE_MIGRATE_TEAM_PAYMENT)}
                  </Styled.Message>
                </Styled.MigrationDiscount>
              )}
            </>
          )}
          <Tooltip noMaxWidth title={renderTooltipContent()}>
            <Styled.PurchaseWrapper $disabled={isDisabledButton || nextBilling.loading}>
              <ButtonMaterial
                disabled={isDisabledButton || nextBilling.loading}
                loading={isPurchasing}
                onClick={throttle(_handleConfirmPurchaseModal, CONFIRM_PURCHASE_THROTTLING_TIME, { trailing: false })}
                size={ButtonSize.XL}
                color={ButtonColor.PRIMARY_BLACK}
                fullWidth
              >
                {commonUtils.formatTitleCaseByLocale(t('payment.completePurchase'))}
              </ButtonMaterial>
            </Styled.PurchaseWrapper>
          </Tooltip>
        </Styled.Bill>
        {isOpenInformationModal && <ModalConfirmInformation {...informationModalSetting} />}
      </Styled.Container>
      <BillingFeature plan={plan} />
    </div>
  );
}

PaymentTempBilling.propTypes = {
  billingInfo: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  isPurchasing: PropTypes.bool.isRequired,
  currentOrganization: PropTypes.object,
  openModal: PropTypes.func.isRequired,
  updateModalProperties: PropTypes.func.isRequired,
  setPurchaseState: PropTypes.func.isRequired,
  canUpgrade: PropTypes.bool.isRequired,
  clientId: PropTypes.string,
  updateOrganizationInList: PropTypes.func.isRequired,
  isCardExisted: PropTypes.bool,
  isChangeCard: PropTypes.bool,
  isLoading: PropTypes.bool,
  newOrganization: PropTypes.object.isRequired,
  changeBillingInfo: PropTypes.func.isRequired,
  setOrganizations: PropTypes.func.isRequired,
  stripeAccountId: PropTypes.string,
  isFetchedCard: PropTypes.bool,
};

PaymentTempBilling.defaultProps = {
  clientId: '',
  currentOrganization: null,
  isCardExisted: false,
  isChangeCard: false,
  isLoading: false,
  stripeAccountId: '',
  isFetchedCard: false,
};

export default memo(PaymentTempBilling);
