import selectors from 'selectors';
import { store } from 'store';

import { ExploredFeatures, FEATURE_EXPLORATION_LIMIT_PER_USER } from '../constants';

export type FeatureLimitKey = typeof ExploredFeatures[keyof typeof ExploredFeatures];

// Define the type for the return value of getAvailableFeatures
export type FeatureAvailability = {
  [feature in FeatureLimitKey]: boolean;
};

export const getAvailableFeatures = (): FeatureAvailability => {
  const currentUser = selectors.getCurrentUser(store.getState());
  const exploredFeatures = currentUser?.metadata?.exploredFeatures || {};

  return Object.fromEntries(
    Object.entries(exploredFeatures).map(([feature, count]) => [
      feature,
      (count as number) < FEATURE_EXPLORATION_LIMIT_PER_USER[feature as FeatureLimitKey],
    ])
  ) as FeatureAvailability;
};
