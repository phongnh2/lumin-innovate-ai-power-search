import { useCallback } from 'react';

import { useTranslation } from 'hooks';

import useGetCancelSubProduct from 'features/CNC/hooks/useGetCancelSubProduct';

const useGetPremiumFeatureList = () => {
  const { t } = useTranslation();
  const { isSign, isPdf, isSignAndPdf } = useGetCancelSubProduct();

  const getPremiumFeatureList = useCallback(() => {
    if (isSignAndPdf) {
      return [
        {
          icon: 'file-type-doc-xl',
          label: t('restrictionList.documentStackAndEditingTools'),
          descriptions: [t('restrictionList.limitedDocumentsWithoutPremiumTools')],
        },
        {
          icon: 'ph-signature',
          label: t('restrictionList.agreementQuotaAndPremiumFeatures'),
          descriptions: [t('restrictionList.limitedAgreementsAndTemplates')],
        },
      ];
    }
    if (isSign) {
      return [
        {
          icon: 'ph-signature',
          label: t('restrictionList.agreementQuota'),
          descriptions: [t('restrictionList.limitedAgreements')],
        },
        {
          icon: 'lm-sparkles',
          label: t('restrictionList.features'),
          descriptions: [t('restrictionList.limitedTemplates'), t('restrictionList.limitedCertificateOfCompletion')],
        },
      ];
    }
    if (isPdf) {
      return [
        {
          icon: 'file-type-doc-xl',
          label: t('restrictionList.documentStack'),
          descriptions: [t('restrictionList.limitedDocuments')],
        },
        {
          icon: 'mark-up-doc-md',
          label: t('restrictionList.tools'),
          descriptions: [t('restrictionList.limitedSignatures'), t('restrictionList.limitedPremiumTools')],
        },
      ];
    }
    return [];
  }, [isSignAndPdf, isSign, isPdf]);

  return {
    premiumFeatureList: getPremiumFeatureList(),
  };
};

export default useGetPremiumFeatureList;
