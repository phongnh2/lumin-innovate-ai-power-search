/* eslint-disable sonarjs/no-duplicate-string */
/**
 * This config will be applied to the Editor team
 */
export type Environment = 'local' | 'viewer' | 'viewer-staging' | 'preproduction' | 'production';

export const featureFlagConfig = {
  viewer_navigation: {
    env: <Environment[]>['local', 'viewer', 'viewer-staging', 'preproduction', 'production'],
  },
};

export type FeatureFlagKey = keyof typeof featureFlagConfig;
