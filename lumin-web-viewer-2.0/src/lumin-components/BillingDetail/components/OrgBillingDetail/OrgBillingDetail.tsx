/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FunnelSimpleXIcon } from '@luminpdf/icons/dist/csr/FunnelSimpleX';
import { Divider, Icomoon as KiwiIcomoon, PlainTooltip, Switch as KiwiSwitch } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import actions from 'actions';

import useOrgBillingAction from 'luminComponents/BillingDetail/hooks/useOrgBillingAction';

import { useMobileMatch, useTranslation } from 'hooks';

import { organizationServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';

import { toastUtils } from 'utils';
import errorExtract from 'utils/error';
import { PaymentHelpers } from 'utils/payment';

import { useCancelUnifySubscriptionModalManager } from 'features/CancelUnifySubscriptionModals/hooks';
import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';

import { ErrorCode } from 'constants/errorCode';
import { MESSAGE_MIGRATE_TEAM_PAYMENT } from 'constants/messages';
import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { PaymentStatus } from 'constants/plan.enum';
import { STATIC_PAGE_PRICING } from 'constants/Routers';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { GetUnifySubscriptionData, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import EnterpriseOrgOffer from '../EnterpriseOrgOffer';
import SubscriptionDetail from '../SubscriptionDetail';
import SubscriptionSummary from '../SubscriptionSummary';

import styles from './OrgBillingDetail.module.scss';

type Props = {
  organization: IOrganization;
  currentOrganization: IOrganization;
  subscriptionItem: SubScriptionItemWithAmount;
  subscription: GetUnifySubscriptionData['subscription'];
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
  setUnifyBillingSubscriptionData: (payload: GetUnifySubscriptionData) => void;
};

function OrgBillingDetail({
  subscriptionItem,
  organization,
  upcomingInvoice,
  subscription,
  currentOrganization,
  setUnifyBillingSubscriptionData,
}: Props): JSX.Element {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const isMobile = useMobileMatch();
  const { _id: orgId, name, avatarRemoteId, payment, convertFromTeam, hasPendingInvoice } = organization;
  const { productName, paymentStatus, paymentType } = subscriptionItem;

  const isPDFProduct = productName === UnifySubscriptionProduct.PDF;

  const isCanceling = PaymentHelpers.isMatchingUnifyPaymentStatus({
    payment,
    product: subscriptionItem,
    status: PaymentStatus.CANCELED,
  });

  const { onToggleAction, renderActiveSubscriptionModal } = useCancelUnifySubscriptionModalManager({
    organization,
    upcomingInvoice,
    selectedProduct: subscriptionItem.productName,
    subscriptionItems: subscription.payment.subscriptionItems,
  });
  const {
    cancel: cancelSubscription,
    reactivate: reactivateSubscription,
    renderReactivateUnifySubscriptionModal,
  } = useOrgBillingAction({
    organization,
    subscriptionItems: subscription.payment.subscriptionItems,
    cancelAction: onToggleAction,
    productToReactivate: productName,
    setUnifyBillingSubscriptionData,
  });

  const onClickCancelSubscription = () => {
    if (hasPendingInvoice) {
      return;
    }
    cancelSubscription();
  };

  const onChangeAutoUpgrade = async (enabled: boolean): Promise<void> => {
    try {
      setLoading(true);
      const settings = await organizationServices.changeAutoUpgradeSetting(orgId, enabled);
      orgTracking.trackSettingChanged({
        name: orgTracking.AUTO_UPGRADE,
        previousValue: !enabled,
        newValue: enabled,
      });
      const isUpdateCurrentOrg = currentOrganization._id === organization._id;
      batch(() => {
        dispatch(
          actions.updateOrganizationInList(orgId, {
            settings,
          })
        );
        if (isUpdateCurrentOrg) {
          dispatch(
            actions.updateCurrentOrganization({
              settings,
            })
          );
        }
        setLoading(false);
      });
      toastUtils.success({
        message: enabled ? t('settingBilling.messageEnableAutoUpgrade') : t('settingBilling.messageDisableAutoUpgrade'),
      });
    } catch (e) {
      setLoading(false);
      const { code: errorCode } = errorExtract.extractGqlError(e) as { code: string };
      if (errorCode !== ErrorCode.Org.SCHEDULED_DELETE) {
        toastUtils.openUnknownErrorToast();
      }
    }
  };

  const isDocStackPlan = PaymentHelpers.isDocStackPlan(paymentType);
  const isUsingTrial = paymentStatus === PaymentStatus.TRIALING || payment.status === PaymentStatus.TRIALING;

  return (
    <>
      <div>
        <div className={styles.container}>
          <SubscriptionSummary
            name={name}
            payment={payment}
            avatarRemoteId={avatarRemoteId}
            subscriptionItem={subscriptionItem}
          />
          {isPDFProduct && <EnterpriseOrgOffer subscriptionItem={subscriptionItem} payment={payment} />}
          <Divider />
          <SubscriptionDetail
            subscriptionItem={subscriptionItem}
            subscription={subscription}
            upcomingInvoice={upcomingInvoice}
            entity={organization}
            reactivateSubscription={reactivateSubscription}
          />
          {!isUsingTrial && isDocStackPlan && isPDFProduct && (
            <>
              <Divider />
              <div className={styles.extraSettings}>
                <p className={styles.title}>
                  <span>{t('orgDashboardBilling.title')}</span>
                  <PlainTooltip content={t('orgDashboardBilling.tooltipAutoUpgrade')} maw={326}>
                    <KiwiIcomoon type="info-circle-md" size="md" color="var(--kiwi-colors-surface-on-surface)" />
                  </PlainTooltip>
                </p>
                <div className={styles.learnMoreWrapper}>
                  <p className={styles.hitDocText}>
                    {t('orgDashboardBilling.hitLimit')} {t('orgDashboardBilling.autoUpgrade')}{' '}
                    <Link className={styles.learnMoreText} to={STATIC_PAGE_PRICING} target="_blank">
                      {t('common.learnMore')}.
                    </Link>
                  </p>
                  <PlainTooltip content={t('payment.cannotChangeCurrentPlan')} disabled={!hasPendingInvoice}>
                    <div>
                      <KiwiSwitch
                        disabled={hasPendingInvoice || loading}
                        checked={organization.settings.autoUpgrade}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeAutoUpgrade(e.target.checked)}
                      />
                    </div>
                  </PlainTooltip>
                </div>
              </div>
            </>
          )}
          {!isCanceling && (
            <>
              <Divider />
              <div className={styles.leaveContainer}>
                <FunnelSimpleXIcon
                  size={24}
                  weight="duotone"
                  color="var(--kiwi-colors-support-orange-foreground-medium)"
                />
                <div className={styles.leaveTextContainer}>
                  <span className={styles.leaveText}>{t('unifyBillingSettings.thinkingOfLeaving')}</span>
                  <PlainTooltip content={t('payment.cannotChangeCurrentPlan')} disabled={!hasPendingInvoice}>
                    <span
                      className={styles.cancelText}
                      onClick={onClickCancelSubscription}
                      role="button"
                      tabIndex={0}
                      onKeyDown={onClickCancelSubscription}
                      data-lumin-btn-name={CNCButtonName.CANCEL_SUBSCRIPTION_ON_BILLING_DETAIL_PAGE}
                      data-lumin-btn-purpose={
                        CNCButtonPurpose[CNCButtonName.CANCEL_SUBSCRIPTION_ON_BILLING_DETAIL_PAGE]
                      }
                      data-disabled={hasPendingInvoice}
                    >
                      {t('common.cancelPlan')}
                    </span>
                  </PlainTooltip>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Will deprecated when migration complete */}
        {convertFromTeam && (
          <p className={styles.convertFromTeam}>
            <KiwiIcomoon
              type="info-circle-filled"
              size={isMobile ? 'md' : 'lg'}
              color="var(--kiwi-colors-semantic-success)"
            />
            <span>{t(MESSAGE_MIGRATE_TEAM_PAYMENT)}</span>
          </p>
        )}
      </div>
      {renderActiveSubscriptionModal()}
      {renderReactivateUnifySubscriptionModal()}
    </>
  );
}

export default OrgBillingDetail;
