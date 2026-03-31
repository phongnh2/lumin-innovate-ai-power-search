import React, { useCallback } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { ModalTypes } from 'constants/lumin-common';
import { PaymentTypes, STATUS } from 'constants/plan';

export default function useCancelPayment({ onConfirm, payment, paymentType }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const isPaymentForOrg = paymentType === PaymentTypes.ORGANIZATION;

  const openCancelModal = useCallback(() => {
    const getMessage = () => {
      if (payment.status === STATUS.TRIALING) {
        return {
          title: t('modalCancelFreeTrial.title'),
          message: t('modalCancelFreeTrial.message'),
        };
      }
      if (payment.status === STATUS.PENDING) {
        return {
          title: t('modalCancelPlan.title'),
          message: isPaymentForOrg
            ? t('modalCancelPlan.planIsPending.message')
            : t('modalCancelPlan.planIsPending.messageForIndividualPlan'),
        };
      }
      return {
        title: t('modalCancelPlan.title'),
        message: isPaymentForOrg ? (
          t('modalCancelPlan.message')
        ) : (
          <Trans
            i18nKey="modalCancelPlan.messageForIndividualPlan"
            components={{
              br: <br />,
            }}
          />
        ),
      };
    };

    const { title, message } = getMessage();

    const modalSettings = {
      type: ModalTypes.WARNING,
      title,
      message,
      confirmButtonTitle: isPaymentForOrg ? t('common.confirm') : t('common.cancelPlan'),
      cancelButtonTitle: !isPaymentForOrg && t('common.notNow'),
      color: 'accent',
      onConfirm,
      closeOnConfirm: false,
      onCancel: () => {},
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      useReskinModal: true,
      closeOnRouteChange: true,
    };
    dispatch(actions.openModal(modalSettings));
  }, [payment.type, payment.status, paymentType, dispatch, onConfirm]);

  const openSuccessModal = ({ title, message }) => {
    const modalData = {
      type: isEnableReskin ? null : ModalTypes.SUCCESS,
      title,
      message,
      onConfirm: () => {},
      confirmButtonTitle: t('common.ok'),
      isFullWidthButton: !isEnableReskin,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      useReskinModal: true,
      closeOnRouteChange: true,
      confirmButtonProps: {
        withExpandedSpace: true,
      },
    };
    dispatch(actions.openModal(modalData));
  };

  return { openCancelModal, openSuccessModal };
}
