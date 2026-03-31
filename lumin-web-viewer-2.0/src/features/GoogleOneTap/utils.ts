import { eventTracking } from 'utils/recordUtil';

import { AWS_EVENTS } from 'constants/awsEvents';
import { STATUS_CODE } from 'constants/lumin-common';

import { OAUTH_ENDPOINT_URL } from './constants';
import { IGoogleCallbackResponse, IGoogleEndPointResponse, IUseGoogleOneTapLogin } from './types';

export const fetchGoogleTokenInfo = async (credential: string): Promise<IGoogleEndPointResponse> => {
  const response = await fetch(`${OAUTH_ENDPOINT_URL}${credential}`);

  if (response.status !== STATUS_CODE.SUCCEED) {
    throw new Error('Failed to fetch token info');
  }

  return response.json() as Promise<IGoogleEndPointResponse>;
};

export const createGoogleCallback =
  (onSuccess?: IUseGoogleOneTapLogin['onSuccess'], onError?: IUseGoogleOneTapLogin['onError']) =>
  async (data: IGoogleCallbackResponse) => {
    if (!data?.credential) {
      onError?.(new Error('Missing credential in Google response'));
      return;
    }

    try {
      const tokenInfo = await fetchGoogleTokenInfo(data.credential);
      eventTracking(AWS_EVENTS.GOOGLE_ONE_TAP.SIGN_IN_SUCCESS, {
        email: tokenInfo.email,
      });
      onSuccess?.(tokenInfo);
    } catch (error) {
      onError?.(error as Error);
    }
  };
