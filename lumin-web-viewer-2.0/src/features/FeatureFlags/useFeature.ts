import { FeatureFlagKey } from './configs';
import { isFlagEnable } from './isFlagEnable';

export const useFeature = ({ key }: { key: FeatureFlagKey }) => isFlagEnable({ key });
