import { LoginFlow } from '@ory/client';
import axios from 'axios';

import { ErrorCode } from '@/constants/errorCode';
import { Identity, OryLoginMethod, OryProvider, SelfServiceFlow } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { BaseException } from '@/lib/exceptions/base.exception';
import { BadRequestException } from '@/lib/exceptions/common/BadRequest.exception';
import { clientLogger } from '@/lib/logger';
import { constructFlowCsrfToken, frontendApi } from '@/lib/ory';
import { OidcProviderMapping } from '@/utils/account.utils';
import { getErrorMessage } from '@/utils/error.utils';

import { api } from '../api-slice';

export const signInApi = api.injectEndpoints({
  endpoints: builder => ({
    // init new login flow when the old one is no more valid
    ensureLoginFlow: builder.mutation<
      SelfServiceFlow,
      {
        initial?: SelfServiceFlow;
        returnTo?: string;
        refresh?: boolean;
        organization?: string;
      }
    >({
      queryFn: async ({ initial, returnTo, refresh = false, organization }) => {
        if (initial && !refresh) {
          // use existing not-expired flow
          const expired = new Date(initial.expires_at as string) <= new Date();
          if (!expired) {
            return { data: initial };
          }
        }
        try {
          // init new flow
          const { data: flow } = await frontendApi.createLoginFlow({ returnTo, refresh, organization });
          return { data: flow };
        } catch (e) {
          if (e instanceof BadRequestException) {
            const err = e as BaseException;
            const { code } = err.getResponseError();
            if (code === ErrorCode.Auth.SESSION_ALREADY_AVAILABLE) {
              window.location.reload();
              return {
                error: {
                  status: err.getStatus(),
                  data: null
                }
              };
            }
            throw e;
          } else {
            const _error = axios.isAxiosError(e) ? e.response?.data : e;
            // For debugging purpose, will be remove
            clientLogger.error({ reason: 'debug ensureLoginFlow', message: getErrorMessage(e), attributes: { error: _error } });
            throw e;
          }
        }
      }
    }),

    loginOidc: builder.mutation<object, { flow: SelfServiceFlow; provider: OryProvider; hintEmail?: string; transient_payload?: Record<string, unknown> }>({
      queryFn: async ({ flow, provider, hintEmail, transient_payload = {} }) => {
        try {
          const { loginService, providerId } = OidcProviderMapping[provider];
          await frontendApi.updateLoginFlow({
            flowId: flow.id,
            body: {
              csrf_token: constructFlowCsrfToken(flow),
              method: OryLoginMethod.Oidc,
              provider: providerId,
              traits: {
                loginService
              },
              transient_payload
            }
          });
          return { data: {} };
        } catch (e) {
          const err = e as BaseException;
          const { code, meta } = err.getResponseError();
          if (code === 'browser_location_change_required') {
            if (hintEmail) {
              const paramsObj = { login_hint: hintEmail };
              const searchParams = new URLSearchParams(paramsObj);
              window.location.href = (meta?.redirect_browser_to as string) + `&${searchParams.toString()}`;
            } else {
              window.location.href = meta?.redirect_browser_to as string;
            }
            return {
              error: {
                status: err.getStatus(),
                data: null
              }
            };
          }
          throw err;
        }
      }
    }),
    loginPassword: builder.mutation<Identity, { flow: SelfServiceFlow; email: string; password: string; challenge?: string }>({
      query: req => ({
        url: 'auth/sign-in',
        method: 'POST',
        body: req
      })
    }),
    getLoginFlow: builder.query<LoginFlow | undefined, string>({
      queryFn: async id => {
        if (!id) {
          return { data: undefined };
        }
        const { data: flow } = await frontendApi.getLoginFlow({
          flowId: id
        });
        return { data: flow };
      }
    }),
    verifySsoEmail: builder.mutation<{ providerId: string; organizationId: string }, { email: string }>({
      query: req => ({
        url: 'auth/sso/verify-email',
        method: 'POST',
        body: req
      })
    }),
    loginSamlSso: builder.mutation<Record<string, never>, { flow: SelfServiceFlow; provider: string }>({
      queryFn: async ({ flow, provider }) => {
        try {
          await frontendApi.updateLoginFlow({
            flowId: flow.id,
            body: {
              csrf_token: constructFlowCsrfToken(flow),
              method: OryLoginMethod.Saml,
              provider,
              traits: {
                loginService: LoginService.SAML_SSO
              }
            }
          });
          return { data: {} };
        } catch (e) {
          const err = e as BaseException;
          const { code, meta } = err.getResponseError();
          if (code === 'browser_location_change_required') {
            window.location.href = meta?.redirect_browser_to as string;
            return { data: {} };
          }
          throw err;
        }
      }
    })
  })
});

export const {
  useEnsureLoginFlowMutation,
  useLoginOidcMutation,
  useLoginPasswordMutation,
  useGetLoginFlowQuery,
  useVerifySsoEmailMutation,
  useLoginSamlSsoMutation
} = signInApi;
