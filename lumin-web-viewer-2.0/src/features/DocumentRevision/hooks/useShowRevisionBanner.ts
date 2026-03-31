import { get } from 'lodash';
import { useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { DocumentService } from 'constants/document.enum';
import { Plans } from 'constants/plan';

import { useGetEnhancedFeaturesPlan } from './useEnhancedFeaturesPlan';

export function useShowRevisionBanner() {
  const canUseEnhancedFeatures = useGetEnhancedFeaturesPlan();

  const isToolPropertiesOpen = useSelector(selectors.isToolPropertiesOpen);
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentPlan = get(currentDocument, 'documentReference.data.payment.type', '');
  const hasRevisionBanner =
    !canUseEnhancedFeatures &&
    (currentPlan !== Plans.ENTERPRISE || currentDocument?.service === DocumentService.google) &&
    !currentDocument?.isShared;

  return hasRevisionBanner && isToolPropertiesOpen && toolPropertiesValue === TOOL_PROPERTIES_VALUE.REVISION;
}
