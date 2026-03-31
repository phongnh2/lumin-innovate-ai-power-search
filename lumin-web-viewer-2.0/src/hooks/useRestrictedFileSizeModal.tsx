import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';

import { organizationServices } from 'services';

import { PaymentUtilities } from 'utils/Factory/Payment';
import { PaymentHelpers, PaymentUrlSerializer } from 'utils/payment';

import { MAX_DOCUMENT_SIZE, ModalTypes } from 'constants/lumin-common';
import { UnifySubscriptionPlan } from 'constants/organization.enum';
import { PaymentPeriod } from 'constants/plan.enum';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { useTranslation } from './useTranslation';

type RestrictedFileSizeModalProps = {
  organization?: IOrganization;
  maxSizeAllow: number;
};

const useRestrictedFileSizeModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const baseModalProps = {
    type: ModalTypes.ERROR,
    title: t('modalTransferFile.title'),
    useReskinModal: true,
  };

  const getTrialUrl = ({ orgId, trialInfo }: { orgId: string; trialInfo: IOrganization['payment']['trialInfo'] }) => {
    const paymentUrlSerializer = new PaymentUrlSerializer();
    const trialPlan = PaymentHelpers.evaluateTrialPlan(trialInfo);
    return paymentUrlSerializer
      .trial(true)
      .of(orgId)
      .plan(trialPlan)
      .period(PaymentPeriod.ANNUAL)
      .returnUrlParam()
      .get();
  };

  // eslint-disable-next-line class-methods-use-this
  const getPaymentUrl = ({ orgId }: { orgId: string }) => {
    const paymentUrlSerializer = new PaymentUrlSerializer();
    return paymentUrlSerializer
      .of(orgId)
      .plan(UnifySubscriptionPlan.ORG_PRO)
      .period(PaymentPeriod.ANNUAL)
      .returnUrlParam()
      .get();
  };

  const openMaxSizeLimitModal = (maxSizeAllow: number) => {
    dispatch(
      actions.openModal({
        ...baseModalProps,
        message: t('modalTransferFile.messageForGreaterThanMaximumSize', { maxSizeAllow }),
        confirmButtonTitle: t('common.gotIt'),
        confirmButtonProps: {
          withExpandedSpace: false,
        },
      })
    );
  };

  const openModalForFreeOrg = ({ maxSizeAllow, organization }: RestrictedFileSizeModalProps) => {
    const { _id: orgId, payment } = organization || {};
    const { canStartTrial } = payment?.trialInfo || {};

    dispatch(
      actions.openModal({
        ...baseModalProps,
        message: canStartTrial
          ? t('modalTransferFile.messageForFreeOrgCanStartTrial', { maxSizeAllow })
          : t('modalTransferFile.messageForFreeOrgCannotStartTrial', { maxSizeAllow }),
        confirmButtonTitle: canStartTrial ? t('common.startFreeTrial') : t('common.upgrade'),
        onConfirm: () => {
          navigate(canStartTrial ? getTrialUrl({ orgId, trialInfo: payment.trialInfo }) : getPaymentUrl({ orgId }));
        },
        cancelButtonTitle: t('common.later'),
        onCancel: () => {},
      })
    );
  };

  const openModalForPremiumOrg = ({ maxSizeAllow, organization }: RestrictedFileSizeModalProps) => {
    const { _id: orgId, userRole } = organization || {};

    const isOrgManager = organizationServices.isManager(userRole);

    dispatch(
      actions.openModal({
        ...baseModalProps,
        message: isOrgManager
          ? t('modalTransferFile.messageForManagerOfPremiumOrg', { maxSizeAllow })
          : t('modalTransferFile.messageForMemberOfPremiumOrg', { maxSizeAllow }),
        confirmButtonTitle: isOrgManager ? t('common.upgrade') : t('common.gotIt'),
        onConfirm: () => {
          if (isOrgManager) {
            navigate(getPaymentUrl({ orgId }));
          }
        },
        ...(isOrgManager && {
          cancelButtonTitle: t('common.later'),
          onCancel: () => {},
        }),
      })
    );
  };

  const openRestrictedFileSizeModal = ({ maxSizeAllow, organization }: RestrictedFileSizeModalProps) => {
    if (maxSizeAllow === MAX_DOCUMENT_SIZE) {
      openMaxSizeLimitModal(maxSizeAllow);
      return;
    }
    const paymentUtilities = new PaymentUtilities(organization?.payment);
    if (paymentUtilities.isUnifyFree()) {
      openModalForFreeOrg({ maxSizeAllow, organization });
      return;
    }
    openModalForPremiumOrg({ maxSizeAllow, organization });
  };

  return { openRestrictedFileSizeModal };
};

export default useRestrictedFileSizeModal;
