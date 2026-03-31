import { Avatar, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import { useTranslation } from 'hooks';

import { avatar } from 'utils';
import { PaymentHelpers } from 'utils/payment';

import { PERIOD, Plans, PLAN_TYPE_LABEL } from 'constants/plan';

import { IPayment, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import styles from './SubscriptionSummary.module.scss';

type Props = {
  avatarRemoteId?: string;
  name: string;
  payment: IPayment;
  subscriptionItem?: SubScriptionItemWithAmount;
};

function SubscriptionSummary({ avatarRemoteId, name, payment, subscriptionItem }: Props): JSX.Element {
  const { t } = useTranslation();
  const { paymentType } = subscriptionItem || {};
  const isFree = paymentType === Plans.FREE;

  const getPlanLabel = () =>
    (PLAN_TYPE_LABEL as Record<string, string>)[paymentType] ||
    (PLAN_TYPE_LABEL as Record<string, string>)[payment.type];

  const plan = getPlanLabel();

  const getPlanDetail = (): string => {
    if (isFree) {
      return t('common.free');
    }
    if (subscriptionItem && PaymentHelpers.isOrgTrialing(subscriptionItem)) {
      return t('common.planTrial', { plan });
    }

    return payment.period === PERIOD.MONTHLY ? t('common.planMonthly', { plan }) : t('common.planAnnual', { plan });
  };

  return (
    <div className={styles.container}>
      <p className={styles.title}>{getPlanDetail()}</p>
      <div className={styles.orgInfo}>
        <Avatar src={avatar.getAvatar(avatarRemoteId) || DefaultOrgAvatar} size="xs" variant="outline" name={name} />
        <PlainTooltip content={name}>
          <p className={styles.orgName}>{name}</p>
        </PlainTooltip>
      </div>
    </div>
  );
}

SubscriptionSummary.defaultProps = {
  avatarRemoteId: null,
};

export default SubscriptionSummary;
