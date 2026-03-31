import { FeatureResult } from '@growthbook/growthbook';

import {
  IFeatureFlag,
  IFeatureFlagSettings,
  IGetFeatureValuePayload,
} from './FeatureFlag.interface';
import { GrowthBookProvider } from './GrowthBookProvider';

export class FeatureFlagAdapter implements IFeatureFlag {
  private featureFlagAdaptee: GrowthBookProvider;

  constructor(settings: IFeatureFlagSettings) {
    this.featureFlagAdaptee = new GrowthBookProvider(settings);
  }

  async getFeatureValue<T>({ attributes, featureFlagKey }: IGetFeatureValuePayload): Promise<T> {
    return this.featureFlagAdaptee.getFeatureValueFromAdaptee({ attributes, featureFlagKey });
  }

  async evalFeature<T>({ attributes, featureFlagKey }: IGetFeatureValuePayload): Promise<FeatureResult<T>> {
    return this.featureFlagAdaptee.evalFeatureFromAdaptee({ attributes, featureFlagKey });
  }
}
