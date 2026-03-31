import { BellSimpleIcon } from '@luminpdf/icons/dist/csr/BellSimple';
import { MedalIcon } from '@luminpdf/icons/dist/csr/Medal';
import { SubtitlesIcon } from '@luminpdf/icons/dist/csr/Subtitles';
import { startCase } from 'lodash';
import { Chip, Divider, Icomoon, Stepper, Text } from 'lumin-ui/kiwi-ui';
import React, { useContext, useMemo } from 'react';

import ApplePaymentMethodIcon from 'assets/lumin-svgs/apple-payment-method.svg';
import CashAppPaymentMethod from 'assets/lumin-svgs/cashapp-payment-method.svg';
import GooglePaymentMethodIcon from 'assets/lumin-svgs/google-payment-method.svg';
import LinkPaymentMethod from 'assets/lumin-svgs/link-payment-method.svg';

import { useTranslation } from 'hooks';

import { dateUtil, numberUtils, paymentUtil } from 'utils';

import { NUMBER_OF_MONTHS_IN_YEAR } from 'constants/commonConstant';
import { FREE_TRIAL_DAYS } from 'constants/paymentConstant';
import { DOC_STACK_BLOCK, PERIOD, PRICE } from 'constants/plan';

import { CheckoutModalContext } from '../../context/CheckoutModalContext';
import { OrgPlan } from '../../interface';

import styles from './ReviewPanel.module.scss';

const freeTrialEndsDate = new Date(new Date().getTime() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
const subscriptionStartsDate = new Date(new Date().getTime() + (FREE_TRIAL_DAYS + 1) * 24 * 60 * 60 * 1000);

enum PaymentMethodTypeEnums {
  CARD = 'card',
  LINK = 'link',
  CASH_APP = 'cashapp',
  APPLE_PAY = 'apple pay',
  GOOGLE_PAY = 'google pay',
}

const getTrialExplanationIcon = (step: number) => {
  switch (step) {
    case 0:
      return <MedalIcon weight="duotone" color="var(--kiwi-colors-semantic-information)" size={20} />;
    case 1:
      return <BellSimpleIcon weight="duotone" color="var(--kiwi-colors-support-red-foreground-high)" size={20} />;
    case 2:
      return <SubtitlesIcon weight="duotone" color="var(--kiwi-colors-semantic-information)" size={20} />;
    default:
      return <MedalIcon weight="duotone" color="var(--kiwi-colors-semantic-information)" size={20} />;
  }
};

const ReviewPanel: React.FC = () => {
  const { billingInfo, currentPaymentMethodType } = useContext(CheckoutModalContext);
  const { organization } = billingInfo;
  const currencySymbol = paymentUtil.convertCurrencySymbol(billingInfo.currency);
  const isAnnual = billingInfo.period === PERIOD.ANNUAL;
  const planValue = billingInfo.plan as OrgPlan;
  const docStack = DOC_STACK_BLOCK[billingInfo.period as keyof typeof DOC_STACK_BLOCK][planValue];
  const planPrice = PRICE.V3[billingInfo.period as keyof typeof PRICE.V3][planValue];
  const unitPrice = isAnnual ? planPrice / NUMBER_OF_MONTHS_IN_YEAR : planPrice;
  const planName = startCase(planValue?.split('_')?.[1]?.toLowerCase() ?? '');

  const getPaymentMethodIcon = useMemo(() => {
    switch (currentPaymentMethodType) {
      case PaymentMethodTypeEnums.LINK:
        return <img src={LinkPaymentMethod} alt="Link payment method" />;
      case PaymentMethodTypeEnums.CASH_APP:
        return <img src={CashAppPaymentMethod} alt="Cash App payment method" />;
      case PaymentMethodTypeEnums.APPLE_PAY:
        return <img src={ApplePaymentMethodIcon} alt="Apple Pay payment method" />;
      case PaymentMethodTypeEnums.GOOGLE_PAY:
        return <img src={GooglePaymentMethodIcon} alt="Google Pay payment method" />;
      case PaymentMethodTypeEnums.CARD:
      default:
        return <Icomoon size="sm" type="credit-card-sm" color="var(--kiwi-colors-surface-on-surface)" />;
    }
  }, [currentPaymentMethodType]);

  const { t } = useTranslation();
  return (
    <div className={styles.reviewPanel}>
      <div className={styles.detail}>
        <Text
          type="headline"
          size="sm"
          className={styles.detailHeader}
          ellipsis
          color="var(--kiwi-colors-surface-on-surface)"
        >
          {t('checkoutModal.review.details.yourPlan.title')}
        </Text>
        <div className={styles.detailContent}>
          <div className={styles.planInfo}>
            <Chip
              variant="outline"
              label={`${
                billingInfo.period === PERIOD.ANNUAL ? t('payment.annualBilling') : t('payment.monthlyBilling')
              } billing`}
              size="sm"
              className={styles.planType}
            />
            {billingInfo.period === PERIOD.ANNUAL ? (
              <Chip label={t('payment.save5Months')} size="sm" rounded className={styles.planSavingAmount} />
            ) : null}
          </div>
          <div className={styles.planPrice}>
            <Text type="label" size="xs" color="var(--kiwi-colors-surface-on-surface-variant)">
              {isAnnual
                ? t('checkoutModal.review.billingPanel.annualPrice', {
                    currencySymbol,
                    amount: numberUtils.formatDecimal(planPrice),
                    unitPrice,
                  })
                : t('checkoutModal.review.billingPanel.monthlyPrice', {
                    currencySymbol,
                    amount: numberUtils.formatDecimal(planPrice),
                  })}
            </Text>
            <Divider orientation="vertical" />
            <Text type="label" size="xs" color="var(--kiwi-colors-surface-on-surface-variant)">
              {t('checkoutModal.review.billingPanel.docStackInfo', { docStack })}
            </Text>
          </div>
        </div>
      </div>
      <div className={styles.detail}>
        <Text
          type="headline"
          size="sm"
          className={styles.detailHeader}
          ellipsis
          color="var(--kiwi-colors-surface-on-surface)"
        >
          {t('checkoutModal.review.details.workspace.title')}
        </Text>
        <div className={styles.detailContent}>
          <Text type="label" size="sm" color="var(--kiwi-colors-surface-on-surface)" className={styles.orgName}>
            {organization?.name}
          </Text>
        </div>
      </div>
      <div className={styles.detail}>
        <Text
          type="headline"
          size="sm"
          className={styles.detailHeader}
          ellipsis
          color="var(--kiwi-colors-surface-on-surface)"
        >
          {t('checkoutModal.review.details.paymentMethod.title')}
        </Text>
        <div className={`${styles.detailContent} ${styles.paymentMethod}`}>
          {getPaymentMethodIcon}
          <Text
            type="label"
            size="sm"
            color="var(--kiwi-colors-surface-on-surface)"
            className={styles.paymentMethodText}
          >
            {startCase(currentPaymentMethodType)}
          </Text>
        </div>
      </div>
      <div className={styles.trialExplanation}>
        <Text type="headline" size="md">
          {t('checkoutModal.review.trialExplanation.title')}
        </Text>
        <Stepper
          active={-1}
          orientation="vertical"
          classNames={{
            verticalSeparator: styles.separator,
            step: styles.step,
            stepWrapper: styles.stepWrapper,
            stepIcon: styles.stepIcon,
            stepBody: styles.stepBody,
          }}
          size="xs"
        >
          {(
            t('checkoutModal.review.trialExplanation.description', {
              returnObjects: true,
              trialEndsAt: dateUtil.formatDateAndMonth(freeTrialEndsDate),
              subscriptionStartsAt: dateUtil.formatDateAndMonth(subscriptionStartsDate),
              plan: planName,
            }) as []
          )?.map((item: { overview: string; detail: string }, index: number) => (
            <Stepper.Step
              key={index}
              label={
                <Text type="headline" size="xs">
                  {item.overview}
                </Text>
              }
              description={
                <Text type="label" size="sm">
                  {item.detail}
                </Text>
              }
              icon={getTrialExplanationIcon(index)}
            />
          ))}
        </Stepper>
      </div>
    </div>
  );
};

export default ReviewPanel;
