import { TFunction } from 'i18next';

import { useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { PaymentHelpers, PaymentUrlSerializer } from 'utils/payment';

import { PERIOD, Plans } from 'constants/plan';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationPayment } from 'interfaces/payment/payment.interface';

type TPayload = {
  paymentUrl: string;
  isManager: boolean;
  contentUrl: string;
  orgDestination?: IOrganization;
};

const returnDefault: TPayload = {
  paymentUrl: '',
  isManager: false,
  contentUrl: '',
  orgDestination: null,
};

const getPaymentUrl = (payment: IOrganizationPayment, orgId: string): string => {
  const trialPlan = PaymentHelpers.evaluateTrialPlan(payment.trialInfo);
  return new PaymentUrlSerializer()
    .of(orgId)
    .period(PERIOD.ANNUAL)
    .trial(payment.trialInfo.canStartTrial)
    .plan(trialPlan || Plans.ORG_PRO)
    .returnUrlParam()
    .get();
};

const getContentUrl = ({
  canStartTrial,
  isManager,
  t,
}: {
  canStartTrial: boolean;
  isManager: boolean;
  t: TFunction;
}): string => {
  if (isManager) {
    return canStartTrial ? t('modalMove.getFreeStackNow') : t('modalMove.upgradeNow');
  }
  return canStartTrial ? t('errorMessage.requestAdminToGetFreeStack') : t('errorMessage.requestAdminToUpgrade');
};

const getReturnPayloadData = (organization: IOrganization, t: TFunction): TPayload => {
  const { _id: orgId, payment, userRole } = organization;
  const isManager = organizationServices.isManager(userRole);
  return {
    paymentUrl: getPaymentUrl(payment, orgId),
    isManager,
    contentUrl: getContentUrl({ canStartTrial: payment.trialInfo.canStartTrial, isManager, t }),
    orgDestination: organization,
  };
};

const usePaymentUrlDestination = ({ selectedTarget }: { selectedTarget: IOrganization }): TPayload => {
  const { t } = useTranslation();

  if (!selectedTarget) {
    return returnDefault;
  }

  return getReturnPayloadData(selectedTarget, t);
};

export default usePaymentUrlDestination;
