import { Analytics, Amplify, Auth } from 'aws-amplify';

import { getCommonAttributes } from 'utils/getCommonAttributes';

import getDontShowFreeTrialModalAgainClickedForPageView from 'features/CNC/helpers/getDontShowFreeTrialModalAgainClickedForPageView';
import getNumOfPrefilledEmails from 'features/CNC/helpers/getNumOfPrefilledEmails';

import { SESSION_STORAGE_KEY } from 'constants/sessionStorageKey';

import { fixFailedUpdateEndpoint } from './fixFailedUpdateEndpoint';

const REGION = 'us-east-1';

const amplifyConfig = {
  Auth: {
    identityPoolId: process.env.POOL_ID,
    region: REGION,
  },
};

fixFailedUpdateEndpoint();

Amplify.configure(amplifyConfig);
Auth.configure(amplifyConfig);

const analyticsConfig = {
  AWSPinpoint: {
    // Amazon Pinpoint App Client ID
    appId: process.env.PINPOINT_APP_ID,
    // Amazon service region
    region: REGION,
    mandatorySignIn: false,
    bufferSize: 2000,
    flushSize: 100,
  },
};

const getUrl = () => window.location.origin + window.location.pathname;

Analytics.configure(analyticsConfig);

Analytics.autoTrack('pageView', {
  // REQUIRED, turn on/off the auto tracking
  enable: true,
  eventName: 'pageView',
  attributes: async () => {
    const dontShowFreeTrialModalAgainClicked = getDontShowFreeTrialModalAgainClickedForPageView();
    const numOfPrefilledEmails = getNumOfPrefilledEmails();
    const attributes = await getCommonAttributes({ referrer: document.referrer });
    const previousUrl = sessionStorage.getItem(SESSION_STORAGE_KEY.PINPOINT_PREV_URL_KEY) || '';
    const currentUrl = getUrl();
    if (previousUrl !== currentUrl) {
      sessionStorage.setItem(SESSION_STORAGE_KEY.PINPOINT_PREV_URL_KEY, currentUrl);
    }
    return {
      ...attributes,
      previousUrl,
      dontShowFreeTrialModalAgainClicked,
      numOfPrefilledEmails,
    };
  },
  type: 'SPA',
  provider: 'AWSPinpoint',
  getUrl,
  immediate: true,
});

export default Analytics;
