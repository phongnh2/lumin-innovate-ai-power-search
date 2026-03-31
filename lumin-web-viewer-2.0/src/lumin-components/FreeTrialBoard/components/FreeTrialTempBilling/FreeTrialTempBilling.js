import { Divider, Paper, Text, Icomoon as KiwiIcomoon, PlainTooltip, Button } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import FreeTrialContext from 'lumin-components/OrganizationFreeTrial/FreeTrialContext';
import { FreeTrialBoardContext } from 'luminComponents/FreeTrialBoard/context';
import useFetchCreditBalance from 'luminComponents/OrganizationFreeTrial/hooks/useFetchCreditBalance';

import { useClaimFreeTrial, useMatchPaymentRoute, useTranslation, useRestrictedUser } from 'hooks';
import useOpenExtendFreeTrialModal from 'hooks/useOpenExtendFreeTrialModal';

import { paymentUtil, numberUtils } from 'utils';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useSendBeginCheckoutEvent } from 'features/CNC/hooks';

import { ERROR_MESSAGE_RESTRICTED_ACTION } from 'constants/messages';
import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { Plans, PRICE } from 'constants/plan';

import styles from './FreeTrialTempBilling.module.scss';

const ExtendFreeTrialModal = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'lumin-components/ExtendFreeTrialModal')
);

const FreeTrialTempBilling = () => {
  const { newOrganization } = useContext(FreeTrialBoardContext);
  const { plan, period, isMonthly } = useMatchPaymentRoute();
  const { billingInfo } = useContext(FreeTrialContext);
  const {
    open: openExtendFreeTrialModal,
    onOpen: onOpenExtendFreeTrialModal,
    onClose: onCloseExtendFreeTrialModal,
  } = useOpenExtendFreeTrialModal();
  const { disabled, loading, onClaim, canClaimTrial, claimCtaTooltip } = useClaimFreeTrial({
    newOrganization,
    onOpenExtendFreeTrialModal,
  });
  const availablePaidOrgs = useSelector(selectors.availablePaidOrgs, shallowEqual);
  const { isOrgCreationRestricted } = useRestrictedUser();
  const { t } = useTranslation();
  const currencySymbol = paymentUtil.convertCurrencySymbol(billingInfo.currency);
  const { organizationId } = billingInfo;
  const {
    creditBalance,
    isLoading: isFetching,
    nextBillingPrice,
  } = useFetchCreditBalance({
    clientId: organizationId,
    period,
    currency: billingInfo.currency,
    stripeAccountId: billingInfo.stripeAccountId,
    subscriptionItems: [
      {
        // Free Trial currently only applicable for PDF product
        productName: UnifySubscriptionProduct.PDF,
        planName: plan,
        quantity: 1, // default quantity is always 1, the actual quantity will be finalized from backend side
      },
    ],
  });
  const isPreventCreateOrg = isOrgCreationRestricted && !availablePaidOrgs.length;

  useSendBeginCheckoutEvent({ currency: billingInfo.currency, organizationId });

  const renderTooltipNotThisAction = () => isPreventCreateOrg && ERROR_MESSAGE_RESTRICTED_ACTION;

  const renderClaimButton = () => {
    const isDisabled = disabled || !canClaimTrial || isFetching || isPreventCreateOrg;
    return (
      <PlainTooltip maw={370} position="top" content={renderTooltipNotThisAction() || claimCtaTooltip}>
        <Button fullWidth onClick={onClaim} loading={loading} disabled={isDisabled} size="lg">
          {t('freeTrialPage.claimMyFreeTrial')}
        </Button>
      </PlainTooltip>
    );
  };

  const getTextPlan = () => {
    switch (plan) {
      case Plans.ORG_PRO:
        return t('common.proFreeTrial');
      case Plans.ORG_BUSINESS:
        return t('common.businessFreeTrial');
      default:
        return t('common.starterFreeTrial');
    }
  };

  const textInfo = (
    <>
      <Trans
        i18nKey={isMonthly ? 'freeTrialPage.infoBillingMonth' : 'freeTrialPage.infoBillingYear'}
        components={{ b: <b /> }}
        values={{
          days: FREE_TRIAL_DAYS,
          nextDate: paymentUtil.getNextBillingDateFreeTrial(),
          currencySymbol,
          price: numberUtils.formatDecimal(
            canClaimTrial && nextBillingPrice ? nextBillingPrice / 100 : PRICE.V3[period][plan]
          ),
        }}
      />
      {Boolean(creditBalance) && canClaimTrial && (
        <Trans
          i18nKey="payment.infoUnusedPreviousPlan"
          components={{ b: <b /> }}
          values={{
            currencySymbol,
            creditBalance: numberUtils.formatDecimal(creditBalance / 100),
          }}
        />
      )}
    </>
  );

  return (
    <Paper radius="md" shadow="sm" className={styles.containerReskin}>
      <div className={styles.header}>
        <Text type="headline" size="md">
          {t('common.billing')}
        </Text>
      </div>
      <div className={styles.body}>
        <div className={styles.planInfo}>
          <Text type="headline" size="lg">
            {getTextPlan()}
          </Text>
          <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
            {textInfo}
          </Text>
        </div>
        <Divider />
        <div className={styles.billing}>
          <div className={styles.ammount}>
            <div className={styles.row}>
              <Text type="headline" size="sm">
                {t('freeTrialPage.amountDueToday')}
              </Text>
              <Text component="span" type="headline" size="lg" className={styles.bold} data-cy="amount_due_today">
                {currencySymbol}0.0
              </Text>
            </div>
          </div>
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
          {renderClaimButton()}
        </div>
      </div>
      {openExtendFreeTrialModal && <ExtendFreeTrialModal onClose={onCloseExtendFreeTrialModal} />}
    </Paper>
  );
};

export default FreeTrialTempBilling;
