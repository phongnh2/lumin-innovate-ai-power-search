import { AxiosError } from 'axios';
import { useCallback } from 'react';

import { useLatestRef } from 'hooks/useLatestRef';

import { kratosService } from 'services/oryServices';

import { useCreateLoginFlow, constructFlowCsrfToken } from './useCreateLoginFlow';
import { LoginService, OryLoginMethod, OryProvider } from '../constants';
import { IGoogleEndPointResponse } from '../types';

interface IBrowserLocationChangeErrorData {
  error?: {
    id?: string;
  };
  redirect_browser_to?: string;
}

const BROWSER_LOCATION_CHANGE_REQUIRED = 'browser_location_change_required';

const isBrowserLocationChangeRequired = (error: unknown): error is AxiosError<IBrowserLocationChangeErrorData> => {
  const errorData = (error as AxiosError<IBrowserLocationChangeErrorData>)?.response?.data;
  return errorData?.error?.id === BROWSER_LOCATION_CHANGE_REQUIRED;
};

const buildRedirectUrl = (baseUrl: string, emailHint: string): string => {
  const searchParams = new URLSearchParams({ login_hint: emailHint });
  return `${baseUrl}&${searchParams.toString()}`;
};

export const useGoogleLogin = () => {
  const hrefRef = useLatestRef(window.location.href);

  const [createLoginFlow] = useCreateLoginFlow({
    returnTo: hrefRef.current,
    refresh: false,
  });

  const redirectHandler = useCallback(
    ({ error, emailHint }: { error: unknown; emailHint: string }): { error: unknown; data?: null } => {
      if (isBrowserLocationChangeRequired(error)) {
        const redirectUrl = error.response?.data?.redirect_browser_to;
        if (redirectUrl) {
          window.location.href = buildRedirectUrl(redirectUrl, emailHint);
          return { error: error.response?.data, data: null };
        }
      }
      throw error;
    },
    []
  );

  const login = useCallback(
    async (googleResponse: IGoogleEndPointResponse) => {
      const emailHint = googleResponse.email;
      try {
        const { data: flow } = await createLoginFlow();
        if (!flow) {
          throw new Error('Missing oidc flow');
        }
        await kratosService.updateLoginFlow({
          flow: flow.id,
          updateLoginFlowBody: {
            csrf_token: constructFlowCsrfToken(flow),
            method: OryLoginMethod.Oidc,
            provider: OryProvider.Google,
            traits: {
              loginService: LoginService.GOOGLE,
            },
          },
        });
        return { data: {} };
      } catch (error: unknown) {
        return redirectHandler({ error, emailHint });
      }
    },
    [createLoginFlow, redirectHandler]
  );

  return [login] as const;
};
