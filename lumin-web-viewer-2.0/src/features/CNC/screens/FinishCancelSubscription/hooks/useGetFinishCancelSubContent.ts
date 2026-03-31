import { useGetCurrentOrganization, useTranslation } from 'hooks';

import { PaymentUtilities } from 'utils/Factory/Payment';

import useGetCancelSubProduct from 'features/CNC/hooks/useGetCancelSubProduct';

const useGetFinishCancelSubContent = () => {
  const currentOrganization = useGetCurrentOrganization();
  const { isSign, isPdf, isSignAndPdf } = useGetCancelSubProduct();
  const paymentUtilities = new PaymentUtilities(currentOrganization.payment);
  const { t } = useTranslation();

  // Cancels immediately
  if (
    (isSignAndPdf && paymentUtilities.isUnifyFree()) ||
    (isPdf && !isSign && paymentUtilities.isPdfFree()) ||
    (isSign && !isPdf && paymentUtilities.isSignFree())
  ) {
    return {
      title: t('finishCancelSubscription.cancelledImmediateTitle'),
      description: t('finishCancelSubscription.cancelledImmediateDescription'),
    };
  }

  return {
    title: t('finishCancelSubscription.cancelledTitle'),
    description: t('finishCancelSubscription.cancelledDescription'),
  };
};

export default useGetFinishCancelSubContent;
