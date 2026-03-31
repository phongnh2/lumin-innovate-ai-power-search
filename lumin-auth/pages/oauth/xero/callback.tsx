import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { XeroOAuthMessage, XeroOAuthMessageType } from '@/interfaces/xero';
import { exchangeCodeForUserInfo, getOAuthResultStorageKey } from '@/services/xero.service';

const handleError = (errorMessage: string, state: string): void => {
  const message: XeroOAuthMessage = {
    type: XeroOAuthMessageType.ERROR,
    error: errorMessage
  };
  const storageKey = getOAuthResultStorageKey(state);
  localStorage.setItem(storageKey, JSON.stringify(message));
  window.close();
};

const handleSuccess = (email: string, state: string): void => {
  const message: XeroOAuthMessage = {
    type: XeroOAuthMessageType.SUCCESS,
    email
  };
  const storageKey = getOAuthResultStorageKey(state);
  localStorage.setItem(storageKey, JSON.stringify(message));
  window.close();
};

const processTokenExchange = async (code: string, state: string): Promise<void> => {
  const userInfo = await exchangeCodeForUserInfo(code, state);
  if (!userInfo.email) {
    throw new Error('Failed to extract email from user info');
  }

  handleSuccess(userInfo.email, state);
};

export default function XeroCallbackPage() {
  const router = useRouter();
  const { code, state, error } = router.query;

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const handleCallback = async () => {
      const stateValue = String(state || '');

      if (error) {
        handleError(error === 'access_denied' ? 'User cancelled the authorization' : String(error), stateValue);
        return;
      }

      if (!code || !state) {
        handleError('Missing authorization code or state', stateValue);
        return;
      }

      try {
        await processTokenExchange(String(code), stateValue);
      } catch (err) {
        handleError(err instanceof Error ? err.message : 'Failed to complete OAuth flow', stateValue);
      }
    };

    handleCallback();
  }, [router.isReady, code, state, error]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Processing Xero authentication...</div>
    </div>
  );
}
