import { ModalTypes } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { getRedirectOrgUrl } from 'utils/orgUrlUtils';

import { UnifySubscriptionProduct } from 'constants/organization.enum';
import { PaymentPlans, PaymentStatus } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { GetUnifySubscriptionData, SubScriptionItemWithAmount } from 'interfaces/payment/payment.interface';

import { ActiveSubscriptionModal } from '../components';

type UseCancelUnifySubscriptionModalManagerProps = {
  organization: IOrganization;
  selectedProduct: UnifySubscriptionProduct;
  upcomingInvoice: GetUnifySubscriptionData['upcomingInvoice'];
  subscriptionItems: SubScriptionItemWithAmount[];
};

export const useCancelUnifySubscriptionModalManager = ({
  organization,
  selectedProduct,
  upcomingInvoice,
  subscriptionItems,
}: UseCancelUnifySubscriptionModalManagerProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openedActiveSubscriptionModal, setOpenedActiveSubscriptionModal] = useState(false);

  const productToCancel = subscriptionItems.find((subItem) => subItem.productName === selectedProduct);

  const handleDismiss = () => {
    setOpenedActiveSubscriptionModal(false);
  };

  const handleNavigateToSurveyProcess = () => {
    const url = getRedirectOrgUrl({
      orgUrl: organization.url,
      path: '/subscription/survey',
      search: `?product=${productToCancel.productName.toLowerCase()}`,
    });
    navigate(url);
  };

  const openCancelSubscriptionModal = ({ title, message }: { title: string; message: string }) =>
    dispatch(
      actions.openModal({
        type: ModalTypes.warning,
        title,
        message,
        confirmButtonTitle: t('cancelUnifySubscriptionModals.continueToCancel'),
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
        onConfirm: handleNavigateToSurveyProcess,
        onCancel: handleDismiss,
        useReskinModal: true,
        closeOnRouteChange: true,
      })
    );

  const onToggleAction = () => {
    if (!productToCancel) {
      return;
    }
    const isEnterprise = organization.payment.type === PaymentPlans.ENTERPRISE;
    const activeSubscriptions = subscriptionItems.filter((subItem) => subItem.paymentStatus === PaymentStatus.ACTIVE);
    const hasOnlyOneActiveSubscription = activeSubscriptions.length === 1;
    const hasMultipleActiveSubscriptions = activeSubscriptions.length >= 2;

    if (productToCancel.paymentStatus === PaymentStatus.TRIALING) {
      openCancelSubscriptionModal({
        title: t('cancelUnifySubscriptionModals.cancelFreeTrialTitle'),
        message: t('cancelUnifySubscriptionModals.cancelFreeTrialDescription'),
      });
      return;
    }
    if (hasOnlyOneActiveSubscription || (isEnterprise && activeSubscriptions.length < 2)) {
      handleNavigateToSurveyProcess();
      return;
    }
    if (hasMultipleActiveSubscriptions) {
      setOpenedActiveSubscriptionModal(true);
      return;
    }
    openCancelSubscriptionModal({
      title: t('cancelUnifySubscriptionModals.cancelTitle'),
      message: t('cancelUnifySubscriptionModals.cancelSubDescription'),
    });
  };

  const renderActiveSubscriptionModal = () =>
    openedActiveSubscriptionModal && (
      <ActiveSubscriptionModal
        onClose={handleDismiss}
        nextInvoice={upcomingInvoice?.nextInvoice || 0}
        organization={organization}
        subscriptionItems={subscriptionItems}
        productToCancel={productToCancel}
      />
    );

  return {
    onToggleAction,
    renderActiveSubscriptionModal,
  };
};
