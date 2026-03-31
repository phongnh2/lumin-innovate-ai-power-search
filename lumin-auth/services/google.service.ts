import { environment } from '@/configs/environment';
import { LoggerScope } from '@/constants/common';
import { clientLogger } from '@/lib/logger';
import { getErrorMessage } from '@/utils/error.utils';

export const getTokenInfo = ({ accessToken, callback }: { accessToken: string; callback: (email: string) => any }) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.googleapis.com/oauth2/v3/tokeninfo');
  xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  xhr.send();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.response);
        callback(response.email);
      } else {
        clientLogger.error({ message: getErrorMessage(xhr.response), reason: LoggerScope.ERROR.GOOGLE_EXCEPTION, attributes: {} });
      }
    }
  };
};

export const loginPopup = ({ callback, loginHint }: { callback: (email: string) => any; loginHint: string }) => {
  const client = window.google.accounts.oauth2.initTokenClient({
    client_id: environment.public.google.clientId,
    scope: ['profile', 'email'].join(' '),
    hint: loginHint || '',
    callback: ({ access_token: accessToken }) => {
      getTokenInfo({ accessToken, callback });
    },
    error_callback: (err: any) => {
      if (err.type === 'popup_closed') {
        callback('');
        return;
      }
      clientLogger.error({ message: getErrorMessage(err), reason: LoggerScope.ERROR.GOOGLE_EXCEPTION, attributes: {} });
    }
  });
  client.requestAccessToken();
};
