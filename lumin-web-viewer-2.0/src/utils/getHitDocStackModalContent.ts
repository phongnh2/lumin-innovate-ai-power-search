import { TFunction } from 'react-i18next';
import { NavigateFunction } from 'react-router';

import { organizationServices } from 'services';

import { getHitLimitModal } from 'helpers/getHitLimitModal';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { PaymentHelpers, PaymentUrlSerializer } from 'utils/payment';

import { ModalTypes } from 'constants/lumin-common';
import { PERIOD } from 'constants/plan';

import { HitDocStackModal } from 'interfaces/document/document.interface';
import { IOrganizationPayment, ITrialInfo } from 'interfaces/payment/payment.interface';

import { PaymentUtilities } from './Factory/Payment';

export const getHitDocStackModalContent = ({
  t,
  navigate,
  orgId,
  payment,
  trialInfo = {},
  userRole,
}: {
  t: TFunction;
  navigate: NavigateFunction;
  orgId: string;
  payment: IOrganizationPayment;
  trialInfo: Partial<ITrialInfo>;
  userRole: string;
}): HitDocStackModal => {
  const isOrgManager = organizationServices.isManager(userRole);
  const paymentUtilities = new PaymentUtilities(payment);
  const paymentType = paymentUtilities.getPdfPaymentType();
  const isUnifyFree = paymentUtilities.isUnifyFree();
  const upgradeModalName = ModalName.REQUEST_UPGRADE_HIT_LIMIT;
  const startTrialModalName = ModalName.REQUEST_START_TRIAL_HIT_LIMIT;
  const onUpgrade = () => {
    navigate(PaymentHelpers.getNextPaymentUrl({ payment: { type: paymentType }, orgId }));
    modalEvent
      .modalConfirmation({ modalName: upgradeModalName, modalPurpose: ModalPurpose[upgradeModalName] })
      .catch(() => {});
  };

  const onCancelUpgrade = () => {
    modalEvent
      .modalDismiss({ modalName: upgradeModalName, modalPurpose: ModalPurpose[upgradeModalName] })
      .catch(() => {});
  };

  const onStartTrial = () => {
    const trialPlan = PaymentHelpers.evaluateTrialPlan(trialInfo);
    const trialUrl = new PaymentUrlSerializer()
      .of(orgId)
      .period(PERIOD.ANNUAL)
      .trial(trialInfo.canStartTrial)
      .plan(trialPlan)
      .returnUrlParam();
    navigate(trialUrl.get());
    modalEvent
      .modalConfirmation({
        modalName: startTrialModalName,
        modalPurpose: ModalPurpose[upgradeModalName],
      })
      .catch(() => {});
  };

  const onCancelTrial = () => {
    modalEvent
      .modalDismiss({ modalName: startTrialModalName, modalPurpose: ModalPurpose[startTrialModalName] })
      .catch(() => {});
  };

  return getHitLimitModal({
    isOrgManager,
    isUnifyFree,
    canStartTrial: trialInfo.canStartTrial,
    type: ModalTypes.FIRE,
    titleKey: 'modalHitlimit.title',
    onUpgrade,
    onCancelUpgrade,
    onStartTrial,
    onCancelTrial,
    t,
  });
};
