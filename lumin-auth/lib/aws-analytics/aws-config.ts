import { environment } from '@/configs/environment';

export const amplifyConfig = {
  autoSessionRecord: true,
  Auth: {
    identityPoolId: environment.public.awsPinpoint.poolId,
    region: environment.public.aws.region
  },
  ssr: true
};

export const analyticsConfig = {
  AWSPinpoint: {
    // Amazon Pinpoint App Client ID
    appId: environment.public.awsPinpoint.pinpointAppId,
    // Amazon service region
    region: environment.public.aws.region,
    mandatorySignIn: false
  }
};
