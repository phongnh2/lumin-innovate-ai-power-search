import { AWSPinpointProvider } from 'aws-amplify';

const clearCachedEndPoints = () => {
  const allKeys = Object.keys(localStorage);
  const keysToClear = allKeys.filter(
    (key) =>
      key.indexOf('aws-amplify-cacheAWSPinpoint') > -1 ||
      key.indexOf('CognitoIdentityId') > -1 ||
      key.indexOf('aws-amplify-cacheCurSize') > -1
  );

  keysToClear.forEach((key) => {
    if (key) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * @description https://github.com/aws-amplify/amplify-js/issues/5423#issuecomment-620307900
 */
export const fixFailedUpdateEndpoint = () => {
  const pinPointProviderPrototype = AWSPinpointProvider.prototype;

  const baseHandleEndpointUpdateFailure = pinPointProviderPrototype._handleEndpointUpdateFailure;
  pinPointProviderPrototype._handleEndpointUpdateFailure = function (failureData) {
    if (failureData?.err) {
      clearCachedEndPoints();
    }

    return baseHandleEndpointUpdateFailure.call(this, failureData);
  };
};
