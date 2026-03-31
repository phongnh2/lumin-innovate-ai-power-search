import { isEmpty } from 'lodash';
import { TFunction } from 'react-i18next';

import { useTranslation } from 'hooks';
import useGetOwnCurrentDoc from 'hooks/useGetOwnCurrentDoc';

import { PaymentHelpers } from 'utils/payment';

import { Plans } from 'constants/plan';
import { PaymentPlans } from 'constants/plan.enum';

type Payload = {
  contentModal: {
    header: string;
    description: string;
    features: string[];
  };
  trialPlan: PaymentPlans;
};

const getContent = (
  t: TFunction
): Record<
  string,
  {
    header: string;
    description: string;
    features: string[];
  }
> => ({
  [Plans.ORG_PRO]: {
    header: t('modalTrial.orgPro.header'),
    description: t('modalTrial.orgPro.description'),
    features: t('modalTrial.orgPro.features', { returnObjects: true }),
  },
  [Plans.ORG_BUSINESS]: {
    header: t('modalTrial.orgBusiness.header'),
    description: t('modalTrial.orgBusiness.description'),
    features: t('modalTrial.orgBusiness.features', { returnObjects: true }),
  },
});

const useGetContentTrialModal = (): Payload => {
  const { t } = useTranslation();
  const { organization: orgOwnCurrentDocument } = useGetOwnCurrentDoc();

  const getTrialPlan = (): PaymentPlans => {
    if (isEmpty(orgOwnCurrentDocument)) {
      return PaymentPlans.ORG_PRO;
    }
    return PaymentHelpers.evaluateTrialPlan(orgOwnCurrentDocument.payment.trialInfo) as PaymentPlans;
  };

  const content = getContent(t);

  return { contentModal: content[getTrialPlan()], trialPlan: getTrialPlan() };
};

export default useGetContentTrialModal;
