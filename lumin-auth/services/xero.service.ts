import { environment } from '@/configs/environment';
import { LoggerScope } from '@/constants/common';
import { XeroOAuthMessageType, XeroOAuthMessage } from '@/interfaces/xero';
import { clientLogger } from '@/lib/logger';
import { getErrorMessage } from '@/utils/error.utils';

interface XeroUserInfoResponse {
  email: string;
  given_name?: string;
  family_name?: string;
}

const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getOAuthResultStorageKey = (state: string): string => {
  return `xero_oauth_result_${state}`;
};

export const loginPopup = ({ callback }: { callback: (email: string) => void }): void => {
  const clientId = environment.public.xero.clientId;
  const redirectUri = `${environment.public.host.authUrl}/oauth/xero/callback`;
  const scope = ['openid', 'profile', 'email'].join(' ');
  const state = generateState();

  // Store state in sessionStorage for verification
  sessionStorage.setItem('xero_oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state
  });
  const authUrl = `https://login.xero.com/identity/connect/authorize?${params.toString()}`;

  const popup = window.open(authUrl, 'XeroAuthPopup', 'width=600,height=700,scrollbars=yes,resizable=yes');

  if (!popup) {
    clientLogger.error({
      message: 'Failed to open Xero OAuth popup',
      reason: LoggerScope.ERROR.XERO_EXCEPTION,
      attributes: {}
    });
    callback('');
    return;
  }

  // use localStorage for communication
  const storageKey = getOAuthResultStorageKey(state);

  const storageEventHandler = (e: StorageEvent) => {
    if (e.key === storageKey && e.newValue) {
      try {
        const data = JSON.parse(e.newValue) as XeroOAuthMessage;

        switch (data.type) {
          case XeroOAuthMessageType.SUCCESS:
            callback(data.email || '');
            break;
          case XeroOAuthMessageType.ERROR:
            clientLogger.error({
              message: data.error || 'Xero OAuth error',
              reason: LoggerScope.ERROR.XERO_EXCEPTION,
              attributes: {}
            });
            callback('');
            break;
          case XeroOAuthMessageType.CANCELLED:
            callback('');
            clientLogger.error({
              message: 'Xero OAuth cancelled',
              reason: LoggerScope.ERROR.XERO_EXCEPTION,
              attributes: {}
            });
            break;
        }
      } catch (error) {
        clientLogger.error({
          message: getErrorMessage(error),
          reason: LoggerScope.ERROR.XERO_EXCEPTION,
          attributes: {}
        });
      } finally {
        window.removeEventListener('storage', storageEventHandler);
        localStorage.removeItem(storageKey);
      }
    }
  };
  window.addEventListener('storage', storageEventHandler);
};

export const exchangeCodeForUserInfo = async (code: string, state: string): Promise<XeroUserInfoResponse> => {
  const storedState = sessionStorage.getItem('xero_oauth_state');
  if (!storedState || storedState !== state) {
    throw new Error('Invalid state parameter');
  }
  sessionStorage.removeItem('xero_oauth_state');

  const redirectUri = `${environment.public.host.authUrl}/oauth/xero/callback`;
  const response = await fetch('/api/xero/user-info', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code,
      state,
      redirect_uri: redirectUri
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to exchange code for user info' }));
    throw new Error(error.message);
  }

  return response.json();
};
