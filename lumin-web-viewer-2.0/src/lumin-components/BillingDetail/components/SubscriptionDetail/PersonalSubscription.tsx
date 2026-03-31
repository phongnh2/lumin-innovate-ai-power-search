import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import usePersonalBillingAction from 'luminComponents/BillingDetail/hooks/usePersonalBillingAction';

import { useTranslation } from 'hooks';

import { numberUtils, paymentUtil } from 'utils';
import date from 'utils/date';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { PaymentUrlSerializer } from 'utils/payment';

import { PERIOD, PLAN_TYPE_LABEL, Plans } from 'constants/plan';
import { PaymentStatus } from 'constants/plan.enum';

import { GetUnifySubscriptionData } from 'interfaces/payment/payment.interface';
import { IUser } from 'interfaces/user/user.interface';

import PremiumButtonGroup from './PremiumButtonGroup';

import styles from './SubscriptionDetail.module.scss';

type Props = {
  user: IUser;
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
  subscription: GetUnifySubscriptionData['subscription'];
};

const DescriptionText = ({ children }: { children: React.ReactNode }) => (
  <p className={styles.description}>{children}</p>
);

function PersonalSubscription({ user, upcomingInvoice, subscription }: Props): JSX.Element {
  const { t } = useTranslation();

  const { payment } = user;
  const isCanceling = (payment.status as PaymentStatus) === PaymentStatus.CANCELED;

  const personalBillingActions = usePersonalBillingAction({ user });

  const getBoldText = () => <span className="kiwi-message--primary" />;

  const renderPriceDescription = (): JSX.Element => {
    if (isCanceling) {
      const canceledDate = date.formatMDYTime(subscription.nextInvoice * 1000);
      return (
        <DescriptionText>
          <Trans
            i18nKey="settingBilling.cancelledPlan"
            components={{ span: getBoldText() }}
            values={{ canceledDate }}
          />
        </DescriptionText>
      );
    }

    if (!upcomingInvoice) {
      return <DescriptionText>{t('settingBilling.noUpcomingInvoiceFound')}</DescriptionText>;
    }

    const nextBilling = date.formatMDYTime(upcomingInvoice.nextInvoice * 1000);
    const currencySymbol: string = paymentUtil.convertCurrencySymbol(upcomingInvoice.currency) as string;
    const upcomingAmount = `${currencySymbol}${numberUtils.formatDecimal(upcomingInvoice.amount / 100)}`;
    return (
      <DescriptionText>
        <Trans
          i18nKey="settingBilling.autoRenewPersonalPlan"
          components={{ span: getBoldText() }}
          values={{ nextBilling, upcomingAmount }}
        />
      </DescriptionText>
    );
  };

  const getPlanLabel = () => (PLAN_TYPE_LABEL as Record<string, string>)[payment.type];

  const renderPlanCta = () => {
    const serializer = new PaymentUrlSerializer().plan(Plans.ORG_PRO).period(PERIOD.ANNUAL);
    return (
      <PremiumButtonGroup
        isProfessionalUser
        payment={payment}
        cancelSubscription={personalBillingActions.cancel}
        reactivate={personalBillingActions.reactivate}
        upgradeButtonProps={{
          text: t('common.upgradePlan'),
          component: Link,
          to: serializer.get(),
          eventName: ButtonName.GO_PREMIUM_ON_BILLING_SETTINGS,
        }}
      />
    );
  };

  return (
    <>
      <div>
        <DescriptionText>
          <Trans
            i18nKey={
              payment.period === PERIOD.MONTHLY
                ? 'settingBilling.descPersonalMonthlyPlan'
                : 'settingBilling.descPersonalAnnualPlan'
            }
            components={{ span: getBoldText() }}
            values={{
              plan: getPlanLabel(),
            }}
          />
        </DescriptionText>
        {subscription && renderPriceDescription()}
      </div>
      {renderPlanCta()}
    </>
  );
}

export default PersonalSubscription;
