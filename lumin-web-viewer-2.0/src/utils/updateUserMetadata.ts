import { increaseExploredFeatureUsage } from 'features/EnableToolFromQueryParams/apis/increaseExploredFeatureUsage';
import { ExploredFeatures } from 'features/EnableToolFromQueryParams/constants';
import { ExploredFeatureKeys } from 'features/EnableToolFromQueryParams/constants/exploredFeatureKeys';
import { FeatureLimitKey, getAvailableFeatures } from 'features/EnableToolFromQueryParams/utils/getAvailableFeatures';

export const updateUserMetadataFromFLPSearchParams = async (
  actionParam: string,
  exploredFeatureKey: ExploredFeatureKeys
) => {
  const urlParams = new URLSearchParams(window.location.search);
  const availableFeatures = getAvailableFeatures();
  const from = urlParams.get('from');
  const action = urlParams.get('action');
  const isFromFunctionalLandingPage = from === 'functional-landing-page';
  const isActionMatch = action === actionParam;
  const test = ExploredFeatures[exploredFeatureKey];
  if (!isFromFunctionalLandingPage || !isActionMatch || !availableFeatures[test as FeatureLimitKey]) {
    return false;
  }
  await increaseExploredFeatureUsage({ key: exploredFeatureKey });
  return true;
};
