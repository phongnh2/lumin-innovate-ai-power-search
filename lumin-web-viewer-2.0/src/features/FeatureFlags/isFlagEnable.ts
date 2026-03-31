import { FeatureFlagKey, featureFlagConfig, Environment } from './configs';

export const isFlagEnable = ({ key }: { key: FeatureFlagKey }) => {
  const { env } = featureFlagConfig[key] as { env: Environment[] };
  return {
    enabled: env.includes(process.env.BRANCH as Environment),
  };
};
