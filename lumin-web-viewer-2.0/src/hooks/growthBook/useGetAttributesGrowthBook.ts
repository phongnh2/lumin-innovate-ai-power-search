import { useMemo } from 'react';
import { useMatch } from 'react-router-dom';

import { useViewerMatch } from 'hooks/useViewerMatch';

import { ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';
import { ORG_PATH } from 'constants/organizationConstants';
import { ROUTE_MATCH, Routers } from 'constants/Routers';

import useGetAttributesInOrgPage from './useGetAttributesInOrgPage';
import useGetAttributesInPaymentPage from './useGetAttributesInPaymentPage';
import useGetAttributesInViewer from './useGetAttributesInViewer';
import useGetCommonAttributes from './useGetCommonAttributes';

const useGetAttributesGrowthBook = (): ATTRIBUTES_GROWTH_BOOK => {
  const isInOrgPage = Boolean(useMatch(ORG_PATH));
  const { isViewer } = useViewerMatch();
  const isInPaymentPage = Boolean(useMatch({ path: Routers.PAYMENT, end: false }));
  const isInPaymentTrialPage = Boolean(useMatch({ path: ROUTE_MATCH.PAYMENT_FREE_TRIAL, end: false }));

  const commonAttributes = useGetCommonAttributes();
  const attributesInViewer = useGetAttributesInViewer();
  const attributesInOrgPage = useGetAttributesInOrgPage();
  const attributesInPaymentPage = useGetAttributesInPaymentPage();

  return useMemo((): ATTRIBUTES_GROWTH_BOOK => {
    if (isViewer) {
      return {
        ...commonAttributes,
        ...attributesInViewer,
      };
    }

    if (isInOrgPage) {
      return {
        ...commonAttributes,
        ...attributesInOrgPage,
      };
    }

    if (isInPaymentPage || isInPaymentTrialPage) {
      return {
        ...commonAttributes,
        ...attributesInPaymentPage,
      };
    }

    return commonAttributes;
  }, [
    isViewer,
    isInOrgPage,
    isInPaymentPage,
    isInPaymentTrialPage,
    commonAttributes,
    attributesInViewer,
    attributesInOrgPage,
    attributesInPaymentPage,
  ]);
};

export { useGetAttributesGrowthBook };
