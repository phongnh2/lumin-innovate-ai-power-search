import { Button, Divider, IconButton, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import useFetchCreditBalance from 'luminComponents/OrganizationFreeTrial/hooks/useFetchCreditBalance';

import { useAvailablePersonalWorkspace, useTranslation } from 'hooks';
import { useRestrictedUser } from 'hooks/useRestrictedUser';

import { numberUtils, paymentUtil } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import PaymentMethodInfo from 'features/BillingModal/components/PaymentMethodInfo';
import { BILLING_FORM_STEP } from 'features/BillingModal/constants/billingModal';
import { useClaimFreeTrial } from 'features/BillingModal/hooks/useClaimFreeTrial';
import { useTrialModalContext } from 'features/BillingModal/hooks/useTrialModalContext';

import { ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';
import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { PERIOD, PLAN_TYPE_LABEL, PRICE } from 'constants/plan';
import { PaymentPeriod } from 'constants/plan.enum';

import FreeTrialNotes from '../FreeTrialNotes';

import styles from './BillingSummary.module.scss';

const BillingSummary = ({ closeModal }: { closeModal: () => void }) => {
  const { t } = useTranslation();
  const { billingInfo, currentPaymentMethod, setBillingFormStep, billingFormStep } = useTrialModalContext();
  const { organizationId, plan, period, currency, organization } = billingInfo;
  const {
    creditBalance,
    isLoading: isFetching,
    nextBillingPrice,
  } = useFetchCreditBalance({
    clientId: organizationId,
    period,
    currency,
    stripeAccountId: billingInfo.stripeAccountId,
    subscriptionItems: [
      {
        productName: UnifySubscriptionProduct.PDF,
        planName: plan as UnifySubscriptionPlan,
        quantity: 1,
      },
    ],
  });
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);
  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);

  const { isDriveOnlyUser } = useRestrictedUser();
  const isPreventCreateOrg = isDriveOnlyUser && !availablePaidOrgs.length;
  const isProfessionalUser = useAvailablePersonalWorkspace();

  const priceText = numberUtils.formatDecimal(
    nextBillingPrice ? nextBillingPrice / 100 : PRICE.V3[period][plan as keyof typeof PRICE.V3[PaymentPeriod]]
  );

  const { disabled, loading, onClaim, canClaimTrial } = useClaimFreeTrial({
    newOrganization: null,
  });

  const renderTooltipNotThisAction = () => isPreventCreateOrg && ERROR_MESSAGE_RESTRICTED_ACTION;

  const renderTooltipContent = () => {
    if (isProfessionalUser) {
      return t('freeTrialPage.tooltipCannotBeStartForProfessonal');
    }
    if (organizationId) {
      return t('freeTrialPage.tooltipCannotBeStart');
    }
    return '';
  };

  const renderButton = () => {
    const isDisabled = disabled || !canClaimTrial || isFetching || isPreventCreateOrg;
    if (currentPaymentMethod || billingFormStep === BILLING_FORM_STEP.PAYMENT_ELEMENT_FORM) {
      return (
        <PlainTooltip
          position="top"
          content={renderTooltipNotThisAction() || (!canClaimTrial && renderTooltipContent())}
        >
          <Button size="lg" disabled={isDisabled} onClick={onClaim} loading={loading}>
            {currentPaymentMethod
              ? t('paymentFreeTrial.claimFreeTrial')
              : t('paymentFreeTrial.saveMethodAndClaimFreeTrial')}
          </Button>
        </PlainTooltip>
      );
    }
    return (
      <Button
        size="lg"
        onClick={() => setBillingFormStep(BILLING_FORM_STEP.PAYMENT_ELEMENT_FORM)}
        data-lumin-btn-name={ButtonName.ADD_PAYMENT_METHOD}
      >
        {t('orgDashboardBilling.addPaymentMethod')}
      </Button>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <IconButton
          icon="ph-x"
          size="lg"
          iconColor="var(--kiwi-colors-surface-on-surface)"
          className={styles.closeButton}
          onClick={closeModal}
        />
        <Text size="lg" type="headline">
          {t('common.summary')}
        </Text>
        <Divider color="var(--kiwi-colors-surface-surface-container-high)" />
      </div>
      <div className={styles.content}>
        <div>
          <Text size="md" type="body">
            Lumin PDF - {PLAN_TYPE_LABEL[plan as keyof typeof PLAN_TYPE_LABEL]} {t('pdfFeatures.trial')}
          </Text>
          <p className={styles.description}>
            <Trans
              i18nKey={period === PERIOD.MONTHLY ? 'freeTrialPage.infoBillingMonth' : 'freeTrialPage.infoBillingYear'}
              values={{
                days: FREE_TRIAL_DAYS,
                nextDate: paymentUtil.getNextBillingDateFreeTrial(),
                currencySymbol,
                price: priceText,
              }}
              components={{ b: <b className={styles.boldText} /> }}
            />
            {Boolean(creditBalance) && canClaimTrial && (
              <Trans
                i18nKey="payment.infoUnusedPreviousPlan"
                components={{ b: <b className={styles.boldText} /> }}
                values={{
                  currencySymbol,
                  creditBalance: numberUtils.formatDecimal(creditBalance / 100),
                }}
              />
            )}
          </p>
        </div>
        <FreeTrialNotes />
        {currentPaymentMethod && <PaymentMethodInfo paymentMethod={currentPaymentMethod} orgUrl={organization?.url} />}
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.amountWrapper}>
          <p className={styles.amountText}>{t('freeTrialPage.amountDueToday')}</p>
          <p className={styles.amountValue}>{currencySymbol}0.00</p>
        </div>
        {renderButton()}
      </div>
    </div>
  );
};

export default BillingSummary;
