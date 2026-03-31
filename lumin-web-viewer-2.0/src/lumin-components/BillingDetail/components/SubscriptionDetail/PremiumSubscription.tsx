import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useTranslation } from 'hooks';
import { useTrackingBillingEventName } from 'hooks/useTrackingBillingEventName';

import { numberUtils, paymentUtil } from 'utils';
import date from 'utils/date';
import { getFullPathWithPresetLang } from 'utils/getLanguage';
import { PaymentHelpers, PaymentUrlSerializer } from 'utils/payment';

import { UnifySubscriptionProduct, UnifySubscriptionPlan } from 'constants/organization.enum';
import { PERIOD, PLAN_TYPE_LABEL, Plans } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';
import { STATIC_PAGE_URL } from 'constants/urls';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { GetUnifySubscriptionData, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import PremiumButtonGroup from './PremiumButtonGroup';

import styles from './SubscriptionDetail.module.scss';

type Props = {
  organization: IOrganization;
  subscriptionItem: SubScriptionItemWithAmount;
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
  subscription: GetUnifySubscriptionData['subscription'];
  reactivateSubscription: () => void;
};

const DescriptionText = ({ children }: { children: React.ReactNode }) => (
  <p className={styles.description}>{children}</p>
);

function PremiumSubscription({
  organization,
  upcomingInvoice,
  subscription,
  subscriptionItem,
  reactivateSubscription,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const { payment, docStackStorage, hasPendingInvoice } = organization;
  const { amount, quantity, productName, paymentType } = subscriptionItem;
  const isDocStackPlan = PaymentHelpers.isDocStackPlan(paymentType);
  const isSignProduct = PaymentHelpers.isSignProduct(productName);
  const isTrialing = PaymentHelpers.isMatchingUnifyPaymentStatus({
    payment,
    product: subscriptionItem,
    status: PaymentStatus.TRIALING,
  });
  const isCanceling = PaymentHelpers.isMatchingUnifyPaymentStatus({
    payment,
    product: subscriptionItem,
    status: PaymentStatus.CANCELED,
  });
  const { getTrackGoPremiumEventName } = useTrackingBillingEventName();

  const getBoldText = () => <span className={styles.boldText} />;

  const renderPriceDescription = (): JSX.Element => {
    if (isCanceling && subscription) {
      const canceledDate = date.formatMDYTime(subscription.nextInvoice * 1000);
      return (
        <DescriptionText>
          <Trans
            i18nKey="settingBilling.cancelledPlan"
            components={{
              span: getBoldText(),
            }}
            values={{ canceledDate }}
          />
        </DescriptionText>
      );
    }
    if (!upcomingInvoice) {
      return null;
    }
    const nextBilling = date.formatMDYTime(upcomingInvoice.nextInvoice * 1000);
    const currencySymbol = paymentUtil.convertCurrencySymbol(upcomingInvoice.currency) as string;
    const upcomingAmount = `${currencySymbol}${numberUtils.formatDecimal(amount / 100)}`;

    const renderInformUnUsed = (): JSX.Element => (
      <DescriptionText>
        <Trans
          i18nKey="orgDashboardBilling.informUnusedPreviousPlan"
          components={{
            Text: getBoldText(),
          }}
          values={{ currencySymbol, creditBalance: numberUtils.formatDecimal(upcomingInvoice.creditBalance / 100) }}
        />
      </DescriptionText>
    );

    if (isTrialing) {
      return (
        <>
          <DescriptionText>
            <Trans
              i18nKey="orgDashboardBilling.chargeAfterEnd"
              components={{ Text: getBoldText() }}
              values={{ nextBilling, upcomingAmount }}
            />
          </DescriptionText>
          {Boolean(upcomingInvoice.creditBalance) && renderInformUnUsed()}
        </>
      );
    }
    return (
      <>
        <DescriptionText>
          <Trans
            i18nKey="orgDashboardBilling.autoRenew"
            components={{ Text: getBoldText() }}
            values={{ nextBilling, upcomingAmount }}
          />
        </DescriptionText>
        {Boolean(upcomingInvoice.creditBalance) && renderInformUnUsed()}
      </>
    );
  };

  const getKeyOldPlan = (): string =>
    payment.period === PERIOD.MONTHLY
      ? 'settingBilling.autoRenewOldMonthlyPremiumPlan'
      : 'settingBilling.autoRenewOldAnnualPremiumPlan';

  const getKeyNewPlan = (): string => {
    if (isTrialing) {
      return payment.period === PERIOD.MONTHLY
        ? 'settingBilling.autoRenewTrialMonthlyPremiumPlan'
        : 'settingBilling.autoRenewTrialAnnualPremiumPlan';
    }

    if (isSignProduct) {
      return payment.period === PERIOD.MONTHLY
        ? 'settingBilling.autoRenewMonthlyPremiumSignPlanPlural'
        : 'settingBilling.autoRenewAnnualPremiumSignPlanPlural';
    }

    return payment.period === PERIOD.MONTHLY
      ? 'settingBilling.autoRenewMonthlyPremiumPlan'
      : 'settingBilling.autoRenewAnnualPremiumPlan';
  };

  const getQuantity = () => {
    if (isSignProduct) {
      return quantity;
    }
    return isDocStackPlan ? docStackStorage.totalStack : payment.quantity;
  };

  const isEnterprise = payment.type === Plans.ENTERPRISE;
  const getPlanLabel = () =>
    (PLAN_TYPE_LABEL as Record<string, string>)[paymentType] ||
    (PLAN_TYPE_LABEL as Record<string, string>)[payment.type];
  const isPDFProduct = productName === UnifySubscriptionProduct.PDF;

  const getUpgradeButtonProps = () => {
    const enterpriseButtonProps = isEnterprise && {
      href: STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSale')),
      target: '_blank',
      text: t('settingBilling.contactSalesToUpgrade'),
      component: 'a',
    };
    const nextPlan = PaymentHelpers.isDocStackPlan(paymentType) ? paymentType : UnifySubscriptionPlan.ORG_PRO;
    const serializer = new PaymentUrlSerializer()
      .of(organization._id)
      .product(isPDFProduct ? UnifySubscriptionProduct.PDF : UnifySubscriptionProduct.SIGN)
      .plan(nextPlan)
      .returnUrlParam();
    return {
      text: t('common.upgradePlan'),
      to: serializer.get(),
      eventName: getTrackGoPremiumEventName(),
      component: Link,
      ...enterpriseButtonProps,
    };
  };

  return (
    <div className={styles.subscriptionDetail}>
      <div>
        <DescriptionText>
          <Trans
            i18nKey={isDocStackPlan || isSignProduct ? getKeyNewPlan() : getKeyOldPlan()}
            components={{ span: getBoldText() }}
            values={{
              planLabel: getPlanLabel(),
              // eslint-disable-next-line no-nested-ternary
              quantity: getQuantity(),
              count: getQuantity(),
            }}
          />
        </DescriptionText>
        {renderPriceDescription()}
      </div>
      <PremiumButtonGroup
        payment={payment}
        subscriptionItem={subscriptionItem}
        hasPendingInvoice={hasPendingInvoice}
        reactivate={reactivateSubscription}
        upgradeButtonProps={getUpgradeButtonProps()}
      />
    </div>
  );
}

export default PremiumSubscription;
