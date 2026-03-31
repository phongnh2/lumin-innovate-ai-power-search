import React, { Dispatch, SetStateAction } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';

import actions from 'actions';

import { paymentServices } from 'services';

import { errorUtils, toastUtils } from 'utils';
import { PaymentUtilities } from 'utils/Factory/Payment';

import { ModalTypes } from 'constants/lumin-common';
import { Plans } from 'constants/plan';
import { PaymentPlans, PaymentTypes } from 'constants/plan.enum';

import { IPayment, IPaymentMethod } from 'interfaces/payment/payment.interface';

import { useEnableWebReskin } from './useEnableWebReskin';
import useRestrictBillingActions from './useRestrictBillingActions';
import { useTranslation } from './useTranslation';

type Payload = {
  removePaymentCard: () => void;
};

type Params = {
  selectedItem: {
    _id: string;
    type: string;
    plan: PaymentPlans;
    name: string;
    payment: IPayment;
  };
  setPaymentMethodError: Dispatch<SetStateAction<string>>;
  setCurrentPaymentMethod: Dispatch<SetStateAction<IPaymentMethod>>;
};

const useRemovePaymentCard = ({ selectedItem, setPaymentMethodError, setCurrentPaymentMethod }: Params): Payload => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { _id, type, plan, payment, name } = selectedItem;
  const isOrganization = type === PaymentTypes.ORGANIZATION;
  const isFree = plan === Plans.FREE;

  const { isEnableReskin } = useEnableWebReskin();
  const { isRestrictedOrg, openRestrictActionsModal } = useRestrictBillingActions({ orgId: _id });

  const removePaymentCard = async (): Promise<void> => {
    if (isRestrictedOrg) {
      openRestrictActionsModal();
      return;
    }
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    try {
      if (isOrganization) {
        await paymentServices.removeOrganizationPaymentMethod(_id);
      } else {
        await paymentServices.removePersonalPaymentMethod();
      }
      toastUtils.success({ message: t('orgDashboardBilling.paymentMethodHasBeenRemoved') });
      setCurrentPaymentMethod(null);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { message } = errorUtils.extractGqlError(error);
      setPaymentMethodError(message);
    }
  };

  const getMessage = (): string | JSX.Element => {
    if (!isOrganization) {
      if (isFree) {
        return t('orgDashboardBilling.thisActionCannotBeUndone');
      }
      return t('orgDashboardBilling.messageRemovePaymentMethodPersonal');
    }

    const paymentUtilities = new PaymentUtilities(payment);
    const isUnifyFree = paymentUtilities.isUnifyFree();
    if (isOrganization && isUnifyFree) {
      return t('orgDashboardBilling.thisActionCannotBeUndone');
    }

    return (
      <Trans
        i18nKey="orgDashboardBilling.messageRemovePaymentMethodOrg"
        values={{ orgName: name }}
        components={{ b: <b className={isEnableReskin && 'kiwi-message--primary'} /> }}
      />
    );
  };

  const handleShowModalRemoveCard = (): void => {
    if (isRestrictedOrg) {
      openRestrictActionsModal();
      return;
    }
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('orgDashboardBilling.removeThisPaymentMethod'),
      message: getMessage(),
      confirmButtonTitle: t('common.remove'),
      onCancel: () => {},
      onConfirm: removePaymentCard,
      useReskinModal: true,
    };

    dispatch(actions.openModal(modalSettings));
  };

  return { removePaymentCard: handleShowModalRemoveCard };
};

export { useRemovePaymentCard };
