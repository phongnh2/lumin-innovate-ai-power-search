/* eslint-disable sonarjs/no-duplicate-string */
import classNames from 'classnames';
import { Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

import { useMobileMatch, useTranslation } from 'hooks';

import { commonUtils } from 'utils';
import { PaymentHelpers } from 'utils/payment';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import { PaymentStatus } from 'constants/plan.enum';

import { IPayment, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import styles from './SubscriptionDetail.module.scss';

type UpgradeButtonProps = Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target'> & {
  onClick: () => Promise<void>;
  to?: string;
  component: any;
  eventName: string;
};

type Props = {
  payment: IPayment;
  hasPendingInvoice?: boolean;
  reactivate?: () => void;
  isProfessionalUser?: boolean;
  cancelSubscription?: () => void;
  subscriptionItem?: SubScriptionItemWithAmount;
  upgradeButtonProps: Partial<UpgradeButtonProps> & { text: string };
};

function PremiumButtonGroup({
  payment,
  hasPendingInvoice,
  reactivate,
  cancelSubscription,
  isProfessionalUser = false,
  subscriptionItem,
  upgradeButtonProps: { text, eventName, ...buttonRest },
}: Props): JSX.Element {
  const { t } = useTranslation();
  const isMobile = useMobileMatch();
  const isCanceling = PaymentHelpers.isMatchingUnifyPaymentStatus({
    payment,
    product: subscriptionItem,
    status: PaymentStatus.CANCELED,
  });

  const formatText = (_text: string): string => commonUtils.formatTitleCaseByLocale(_text);

  if (isCanceling) {
    return (
      <div className={classNames(isProfessionalUser && styles.buttonGroup)}>
        <Button className={styles.reactivateBtn} size="lg" variant="filled" onClick={reactivate}>
          {t('common.reactivate')}
        </Button>
      </div>
    );
  }

  const linkProps = buttonRest.href
    ? {
        to: buttonRest.href,
        target: '_blank',
      }
    : {
        to: buttonRest.to,
      };
  return (
    <div className={classNames(isProfessionalUser && styles.buttonGroup)}>
      {isProfessionalUser && (
        <PlainTooltip content={t('payment.cannotChangeCurrentPlan')} disabled={!hasPendingInvoice}>
          <Button
            fullWidth={isMobile}
            size="lg"
            variant="outlined"
            disabled={hasPendingInvoice}
            onClick={cancelSubscription}
            data-lumin-btn-name={CNCButtonName.CANCEL_SUBSCRIPTION_ON_BILLING_DETAIL_PAGE}
            data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.CANCEL_SUBSCRIPTION_ON_BILLING_DETAIL_PAGE]}
          >
            {formatText(t('common.cancelPlan'))}
          </Button>
        </PlainTooltip>
      )}
      {Boolean(text) && (
        <PlainTooltip content={t('payment.cannotChangeCurrentPlan')} disabled={!hasPendingInvoice}>
          <div>
            <Link tabIndex={-1} {...linkProps}>
              <Button
                fullWidth={isMobile}
                data-lumin-btn-name={eventName}
                size="lg"
                variant="filled"
                disabled={hasPendingInvoice}
              >
                {formatText(text)}
              </Button>
            </Link>
          </div>
        </PlainTooltip>
      )}
    </div>
  );
}

PremiumButtonGroup.defaultProps = {
  reactivate: null,
  hasPendingInvoice: false,
};

export default PremiumButtonGroup;
