/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useContext } from 'react';
import { batch, useDispatch } from 'react-redux';

import actions from 'actions';

import { WarningBannerContext } from 'HOC/withWarningBanner';

import { useTranslation } from 'hooks';
import useCancelPayment from 'hooks/useCancelPayment';

import { paymentServices } from 'services';

import { errorUtils } from 'utils';
import errorExtract from 'utils/error';
import paymentEvent from 'utils/Factory/EventCollection/PaymentEventCollection';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { SUBSCRIPTION_CANCELED_REASON } from 'constants/awsEvents';
import { WarningBannerType } from 'constants/banner';
import { ModalTypes } from 'constants/lumin-common';
import {
  ERROR_MESSAGE_PAYMENT_CONTACT_SUPPORT,
  MESSAGE_CANCEL_PAYMENT_INDIVIDUAL,
  MESSAGE_REACTIVATED_PAYMENT,
} from 'constants/messages';
import { PaymentTypes } from 'constants/plan';
import { STATIC_PAGE_URL } from 'constants/urls';

import { IUserPayment } from 'interfaces/payment/payment.interface';
import { IUser } from 'interfaces/user/user.interface';

type Props = {
  user: IUser;
};

type Actions = {
  reactivate?: () => Promise<void>;
  cancel: () => void;
};

function usePersonalBillingAction({ user: { _id: userId, payment } }: Props): Actions {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const contextValue = useContext(WarningBannerContext);
  const { refetch } = contextValue[WarningBannerType.BILLING_WARNING.value];
  const { subscriptionRemoteId: subscriptionId } = payment;

  const { openCancelModal, openSuccessModal } = useCancelPayment({
    payment,
    paymentType: PaymentTypes.INDIVIDUAL,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    onConfirm: cancelPlan,
  });

  async function cancelPlan(): Promise<void> {
    try {
      dispatch(actions.closeModal());
      dispatch(actions.openElement('loadingModal'));
      const paymentData: { data: IUserPayment } = await paymentServices.cancelSubscription({
        type: PaymentTypes.INDIVIDUAL,
        clientId: userId,
      });
      batch(() => {
        dispatch(actions.updateCurrentUser({ payment: paymentData.data }));
        refetch(userId, PaymentTypes.INDIVIDUAL);
        openSuccessModal({
          title: t('orgDashboardBilling.cancelSuccessfully'),
          message: t(MESSAGE_CANCEL_PAYMENT_INDIVIDUAL),
        });
        dispatch(actions.closeElement('loadingModal'));
      });
      paymentEvent
        .subscriptionCanceled({
          subscriptionId,
          reason: SUBSCRIPTION_CANCELED_REASON.CANCELED_ON_UI,
        })
        .catch(() => {});
    } catch (error) {
      const { message } = errorExtract.extractGqlError(error);
      let modalData: Record<string, any> = {
        type: ModalTypes.ERROR,
        title: t('common.failed'),
        confirmButtonTitle: t('common.ok'),
        message,
        onConfirm: () => {},
      };
      if (message === t(ERROR_MESSAGE_PAYMENT_CONTACT_SUPPORT)) {
        modalData = {
          title: t('settingBilling.purchaseFailed'),
          confirmButtonTitle: t('common.contact'),
          message,
          onConfirm: () => {
            window.open((STATIC_PAGE_URL ) + getFullPathWithPresetLang(t('url.saleSupport.contactSupport')));
          },
          onCancel: () => {},
        };
      }
      dispatch(actions.openModal(modalData));
    }
  }

  const reactivatePlan = async (): Promise<void> => {
    try {
      dispatch(actions.openElement('loadingModal'));
      const { data } = await paymentServices.reactivateSubscription();
      batch(() => {
        dispatch(actions.updateCurrentUser({ payment: data }));
        refetch(userId, PaymentTypes.INDIVIDUAL);
        openSuccessModal({
          title: t('orgDashboardBilling.reactivateSuccessfully'),
          message: t(MESSAGE_REACTIVATED_PAYMENT),
        });
        dispatch(actions.closeElement('loadingModal'));
      });
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      errorUtils.handleUnknownError({ error: e, t });
      dispatch(actions.closeElement('loadingModal'));
    }
  };

  return {
    cancel: openCancelModal,
    reactivate: reactivatePlan,
  };
}

export default usePersonalBillingAction;
