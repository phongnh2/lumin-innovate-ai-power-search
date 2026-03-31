import { useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';

import selectors from 'selectors';

import { useGetCurrentUser } from 'hooks';

import { getLinearizedDocumentFile } from 'utils/getFileService';

import {
  ExploredFeatures,
  FEATURE_PREMIUM_LIMIT_FOR_GUEST_MODE_FROM_FLP,
} from 'features/EnableToolFromQueryParams/constants';
import { useIsTempEditMode } from 'features/OpenForm';

import { acceptedActionsFromFLP } from 'constants/actionFromFLP';
import { LocalStorageKey } from 'constants/localStorageKey';

import { guestModeManipulateCache } from './base';

export interface IExploreFeaturesGuestModeFLP {
  [ExploredFeatures.EDIT_PDF]: number;
  [ExploredFeatures.PROTECT_PDF]: number;
  [ExploredFeatures.MERGE]: number;
}

export const mapExploredFeatureToToolPropertiesValue = {
  [ExploredFeatures.MERGE]: TOOL_PROPERTIES_VALUE.MERGE,
  [ExploredFeatures.EDIT_PDF]: TOOL_PROPERTIES_VALUE.EDIT_PDF,
};

export const useHandleManipulateDateGuestMode = () => {
  const { isTempEditMode } = useIsTempEditMode();
  const action = new URLSearchParams(location.search).get('action');
  const from = new URLSearchParams(location.search).get('from');
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const currentUser = useGetCurrentUser();
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue);

  const handleAddCache = async () => {
    const file = await getLinearizedDocumentFile(currentDocument.name, null);
    await guestModeManipulateCache.add({ key: currentDocument.remoteId, file });
  };

  const getExploreFeatureData = (): IExploreFeaturesGuestModeFLP => {
    const storageData = localStorage.getItem(LocalStorageKey.EXPLORE_FEATURES_GUEST_MODE_FLP);

    if (!storageData) {
      return {} as IExploreFeaturesGuestModeFLP;
    }

    try {
      return JSON.parse(storageData) as IExploreFeaturesGuestModeFLP;
    } catch {
      return {} as IExploreFeaturesGuestModeFLP;
    }
  };

  const handleStoreExploreFeatureGuestMode = (featureName: keyof IExploreFeaturesGuestModeFLP): void => {
    const existingData = getExploreFeatureData();

    const mergedData: IExploreFeaturesGuestModeFLP = {
      ...existingData,
      [featureName]: (existingData[featureName] || 0) + 1,
    } as IExploreFeaturesGuestModeFLP;

    localStorage.setItem(LocalStorageKey.EXPLORE_FEATURES_GUEST_MODE_FLP, JSON.stringify(mergedData));
  };

  const handleBypassPermission = (featureKey: keyof IExploreFeaturesGuestModeFLP) => {
    if (!featureKey) {
      return false;
    }
    const isAcceptedActionFromFLP = acceptedActionsFromFLP.includes(action);
    const isGuestModeUsingFromFLP = !currentUser && isAcceptedActionFromFLP && from === 'functional-landing-page';
    const storageData = getExploreFeatureData();
    const featureUsedCount = storageData?.[featureKey] || 0;
    const isExeededLimit =
      featureUsedCount >=
      FEATURE_PREMIUM_LIMIT_FOR_GUEST_MODE_FROM_FLP[
        featureKey as keyof typeof FEATURE_PREMIUM_LIMIT_FOR_GUEST_MODE_FROM_FLP
      ];
    const isMatchingToolProperty =
      toolPropertiesValue ===
      mapExploredFeatureToToolPropertiesValue[featureKey as keyof typeof mapExploredFeatureToToolPropertiesValue];
    return (isGuestModeUsingFromFLP && !isExeededLimit) || isMatchingToolProperty;
  };

  return {
    isManipulateInGuestMode: isTempEditMode,
    handleAddCache,
    handleStoreExploreFeatureGuestMode,
    handleBypassPermission,
  };
};
