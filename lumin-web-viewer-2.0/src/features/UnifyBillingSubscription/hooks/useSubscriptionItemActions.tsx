/* eslint-disable sonarjs/no-duplicate-string */
import { ArrowsClockwiseIcon } from '@luminpdf/icons/dist/csr/ArrowsClockwise';
import { CrownSimpleIcon } from '@luminpdf/icons/dist/csr/CrownSimple';
import { XIcon } from '@luminpdf/icons/dist/csr/X';
import { Button, Divider, Icomoon, Menu, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import useOrgBillingAction from 'luminComponents/BillingDetail/hooks/useOrgBillingAction';

import { useTranslation, useAvailablePersonalWorkspace } from 'hooks';

import event from 'utils/Factory/EventCollection/EventCollection';
import { getFullPathWithPresetLang } from 'utils/getLanguage';
import { PaymentHelpers, PaymentUrlSerializer } from 'utils/payment';

import { useCancelUnifySubscriptionModalManager } from 'features/CancelUnifySubscriptionModals/hooks/useCancelUnifySubscriptionModalManager';

import { AWS_EVENTS } from 'constants/awsEvents';
import { ModalTypes } from 'constants/lumin-common';
import { UnifySubscriptionPlan, UnifySubscriptionProduct } from 'constants/organization.enum';
import { UNIFY_PRODUCTS_LABEL_MAPPING } from 'constants/organizationConstants';
import { PaymentTypes, Plans } from 'constants/plan';
import { PaymentPeriod, PaymentStatus } from 'constants/plan.enum';
import { STATIC_PAGE_URL } from 'constants/urls';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import { useUnifyBillingSubscriptionStore } from './useUnifyBillingSubscriptionStore';
import SubscriptionDetailsModal from '../components/SubscriptionDetailsModal';
import styles from '../components/SubscriptionItemsTable/SubscriptionItemsTable.module.scss';

type UseSubscriptionItemActionsProps = {
  type: string;
  organization: IOrganization;
  subscriptionItem: SubScriptionItemWithAmount;
  hasActiveSignSubscription: boolean;
};

const useSubscriptionItemActions = ({
  type,
  organization,
  subscriptionItem,
  hasActiveSignSubscription,
}: UseSubscriptionItemActionsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeMenu, setActiveMenu] = useState<UnifySubscriptionProduct | null>(null);
  const [shouldDisplayBillingDetailsModal, setShouldDisplayBillingDetailsModal] = useState(false);

  const { productName, paymentStatus, paymentType } = subscriptionItem;
  const isFreeSubscription = (paymentType as string) === 'FREE';
  const isTrialling = paymentStatus === PaymentStatus.TRIALING;
  const { payment = {} as IOrganization['payment'], hasPendingInvoice } = organization;
  const isEnterprise = payment.type === Plans.ENTERPRISE;
  const { canStartTrial, highestTrial } = payment.trialInfo;

  const { subscription, upcomingInvoice, setUnifyBillingSubscriptionData } = useUnifyBillingSubscriptionStore();
  const { onToggleAction: onCancelSubscription, renderActiveSubscriptionModal } =
    useCancelUnifySubscriptionModalManager({
      organization,
      upcomingInvoice,
      selectedProduct: productName,
      subscriptionItems: subscription.payment.subscriptionItems,
    });

  const isCanceling = PaymentHelpers.isMatchingUnifyPaymentStatus({
    payment,
    product: subscriptionItem,
    status: PaymentStatus.CANCELED,
  });

  const {
    cancel: cancelSubscription,
    reactivate: reactivateSubscription,
    renderReactivateUnifySubscriptionModal,
  } = useOrgBillingAction({
    organization,
    subscriptionItems: subscription.payment.subscriptionItems,
    cancelAction: onCancelSubscription,
    productToReactivate: productName,
    setUnifyBillingSubscriptionData,
  });

  const isProfessionalUser = useAvailablePersonalWorkspace();
  const shouldManagePDF = !isFreeSubscription || isTrialling;
  const shouldUpgradePDF =
    (highestTrial === UnifySubscriptionPlan.ORG_BUSINESS && !canStartTrial) ||
    (hasActiveSignSubscription && isFreeSubscription && !isTrialling) ||
    (isProfessionalUser && isFreeSubscription);

  const handleTrackingEvent = () => {
    const targetProduct = UNIFY_PRODUCTS_LABEL_MAPPING[productName];
    event
      .record({
        name: AWS_EVENTS.CLICK_MONETIZED_TOUCHPOINT,
        attributes: {
          elementName: 'productList',
          targetProduct,
          isStartingTrial: isTrialling,
          organizationId: type === PaymentTypes.ORGANIZATION ? organization._id : '',
        },
      })
      .finally(() => {});
  };

  const renderSubscriptionDetailsModal = () =>
    shouldDisplayBillingDetailsModal && (
      <SubscriptionDetailsModal
        subscriptionItem={subscriptionItem}
        subscription={subscription}
        upcomingInvoice={upcomingInvoice}
        organization={organization}
        setUnifyBillingSubscriptionData={setUnifyBillingSubscriptionData}
        onClose={() => setShouldDisplayBillingDetailsModal(false)}
      />
    );

  const buildPaymentUrl = ({
    product,
    plan,
    isTrial = false,
  }: {
    product: UnifySubscriptionProduct;
    plan?: UnifySubscriptionPlan;
    isTrial?: boolean;
  }) => {
    const builder = new PaymentUrlSerializer()
      .of(organization._id)
      .period(PaymentPeriod.ANNUAL)
      .product(product)
      .returnUrlParam();

    if (isTrial) {
      const trialPlan = PaymentHelpers.evaluateTrialPlan(payment.trialInfo);
      return builder.plan(trialPlan).trial(true).get();
    }

    return builder.plan(plan).get();
  };

  const renderButtonAction = ({
    actionText,
    onClick,
    withTrackingEvent = false,
  }: {
    actionText: string;
    onClick: () => void;
    withTrackingEvent?: boolean;
  }) => {
    const handleClick = () => {
      if (withTrackingEvent) {
        handleTrackingEvent();
      }
      onClick();
    };
    return (
      <Button onClick={handleClick} data-cy="product_action_cta" variant="text" className={styles.actionText} wrapText>
        {actionText}
      </Button>
    );
  };

  const getUpgradeUrl = () =>
    ({
      [UnifySubscriptionProduct.PDF]: buildPaymentUrl({
        product: UnifySubscriptionProduct.PDF,
        plan: PaymentHelpers.isDocStackPlan(paymentType) ? paymentType : UnifySubscriptionPlan.ORG_PRO,
      }),
      [UnifySubscriptionProduct.SIGN]: buildPaymentUrl({
        product: UnifySubscriptionProduct.SIGN,
        plan: UnifySubscriptionPlan.ORG_SIGN_PRO,
      }),
    }[productName]);

  const renderManageMenu = () => {
    const tooltipContent = hasPendingInvoice ? t('payment.cannotChangeCurrentPlan') : '';
    const menuItems = [
      {
        key: 'subscriptionDetails',
        label: t('unifyBillingSettings.subscriptionDetails'),
        onClick: () => setShouldDisplayBillingDetailsModal(true),
        icon: <Icomoon type="receipt-md" size="md" />,
        dataCy: 'details_item',
        display: true,
        divider: false,
      },
      {
        key: 'upgradeSubscription',
        label: t('unifyBillingSettings.upgradeSubscription'),
        onClick: () => navigate(getUpgradeUrl()),
        icon: <CrownSimpleIcon size={20} />,
        dataCy: 'upgrade_item',
        display: !isEnterprise,
        disabled: hasPendingInvoice,
        divider: false,
      },
      {
        key: 'reactivateSubscription',
        label: t('unifyBillingSettings.reactivateSubscription'),
        onClick: reactivateSubscription,
        icon: <ArrowsClockwiseIcon size={20} />,
        dataCy: 'reactivate_item',
        display: isCanceling,
        disabled: hasPendingInvoice,
        divider: true,
      },
      {
        key: 'cancelSubscription',
        label: t('unifyBillingSettings.cancelSubscription'),
        onClick: cancelSubscription,
        icon: <XIcon size={20} />,
        dataCy: 'cancel_item',
        disabled: hasPendingInvoice,
        display: !isCanceling,
        divider: true,
      },
    ];
    return (
      <Menu
        ComponentTarget={renderButtonAction({
          actionText: t('unifyBillingSettings.manage'),
          onClick: () => {},
        })}
        itemSize="regular"
        position="bottom-end"
        classNames={{
          dropdown: styles.dropdown,
        }}
        opened={activeMenu === productName}
        onChange={(opened) => setActiveMenu(opened ? productName : null)}
      >
        {menuItems.map(
          (item) =>
            item.display && (
              <>
                {item.divider && <Divider my="var(--kiwi-spacing-1)" />}
                <PlainTooltip content={tooltipContent} disabled={!(item.disabled && tooltipContent)}>
                  <MenuItem
                    disabled={item.disabled}
                    key={item.key}
                    className={styles.menuItem}
                    leftSection={<div className={styles.iconContainer}>{item.icon}</div>}
                    onClick={item.onClick}
                    data-cy={item.dataCy}
                  >
                    {item.label}
                  </MenuItem>
                </PlainTooltip>
              </>
            )
        )}
      </Menu>
    );
  };

  const renderPdfAction = () => {
    if (shouldManagePDF) {
      return renderManageMenu();
    }
    if (shouldUpgradePDF) {
      return renderButtonAction({
        actionText: t('common.upgrade'),
        onClick: () => navigate(getUpgradeUrl()),
        withTrackingEvent: true,
      });
    }
    if (canStartTrial && !isProfessionalUser) {
      return renderButtonAction({
        actionText: t('common.startTrial'),
        onClick: () => navigate(buildPaymentUrl({ product: UnifySubscriptionProduct.PDF, isTrial: true })),
        withTrackingEvent: true,
      });
    }
    return renderManageMenu();
  };

  const renderSignAction = () => {
    if (isEnterprise) {
      return renderButtonAction({
        actionText: t('unifyBillingSettings.contactSales'),
        onClick: () => {
          dispatch(
            actions.openModal({
              useReskinModal: true,
              type: ModalTypes.INFO,
              title: t('common.contactSales'),
              message: <Trans i18nKey="unifyBillingSettings.contactSalesMessage" />,
              cancelButtonTitle: t('common.cancel'),
              confirmButtonTitle: t('unifyBillingSettings.contactSales'),
              onCancel: () => {
                dispatch(actions.closeModal());
              },
              closeOnConfirm: true,
              onConfirm: () => {
                window.open(
                  `${STATIC_PAGE_URL}${getFullPathWithPresetLang(t('url.saleSupport.contactSale'))}`,
                  '_blank'
                );
              },
            })
          );
        },
      });
    }
    if (!isFreeSubscription) {
      return renderManageMenu();
    }
    return renderButtonAction({
      actionText: t('common.upgrade'),
      onClick: () => navigate(getUpgradeUrl()),
      withTrackingEvent: true,
    });
  };

  const renderActions = () =>
    ({
      [UnifySubscriptionProduct.PDF]: renderPdfAction(),
      [UnifySubscriptionProduct.SIGN]: renderSignAction(),
    }[productName]);

  return {
    renderSubscriptionDetailsModal,
    renderActions,
    activeMenu,
    renderActiveSubscriptionModal,
    renderReactivateUnifySubscriptionModal,
  };
};

export default useSubscriptionItemActions;
