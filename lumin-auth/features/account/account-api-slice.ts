import { RecoveryFlow, RegistrationFlow } from '@ory/client';
import axios from 'axios';

import { ErrorCode } from '@/constants/errorCode';
import { SignUpWithInvitationPayload } from '@/interfaces/auth';
import { IOrganization } from '@/interfaces/organization';
import { Identity, OryLoginMethod, OryProvider, SelfServiceFlow } from '@/interfaces/ory';
import { ITeam } from '@/interfaces/team';
import { ForceLogoutType, IUser } from '@/interfaces/user';
import { BaseException } from '@/lib/exceptions/base.exception';
import { constructFlowCsrfToken, frontendApi } from '@/lib/ory';
import { OidcProviderMapping } from '@/utils/account.utils';

import { api } from '../api-slice';

export const accountApi = api.injectEndpoints({
  endpoints: builder => {
    return {
      ensureRecoveryFlow: builder.mutation<SelfServiceFlow, { initial?: SelfServiceFlow; returnTo?: string }>({
        queryFn: async ({ initial, returnTo }) => {
          if (initial) {
            // use existing not-expired flow
            const expired = new Date(initial.expires_at as string) <= new Date();
            if (!expired) {
              return { data: initial };
            }
          }
          try {
            // init new flow
            const { data: flow } = await frontendApi.createRecoveryFlow({
              returnTo
            });
            return { data: flow };
          } catch (e) {
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
            } else {
              throw err;
            }
          }
        }
      }),

      recoverPassword: builder.mutation<void, { flow: SelfServiceFlow; email: string; token: string | null; action: string }>({
        query: req => ({
          url: 'auth/forgot-password',
          method: 'POST',
          body: req
        })
      }),

      ensureRegistrationFlow: builder.mutation<
        RegistrationFlow,
        {
          initialId?: string | null;
          initial?: RegistrationFlow;
          returnTo?: string;
          ref?: string;
          loginChallenge?: string;
        }
      >({
        queryFn: async ({ initialId, initial, returnTo, ref, loginChallenge }) => {
          if (initialId) {
            try {
              const { data } = await frontendApi.getRegistrationFlow({
                flowId: initialId
              });
              // eslint-disable-next-line no-param-reassign
              initial = data;
            } catch (err) {
              if (axios.isAxiosError(err) && err.response?.status === 410) {
                // flow's gone, ignore
              } else {
                throw err;
              }
            }
          }

          if (initial) {
            // use existing not-expired flow
            const expired = new Date(initial.expires_at) <= new Date();
            if (!expired) {
              if (initial.ui?.messages && initial.ui.messages.length > 0) {
                return {
                  error: {
                    message: initial.ui.messages[0].text,
                    code: initial.ui.messages[0].id.toString()
                  }
                };
              }
              return { data: initial };
            }
          }

          const { data: flow } = await frontendApi.createRegistrationFlow(
            {
              returnTo
            },
            {
              params: { ref, login_challenge: loginChallenge }
            }
          );
          return { data: flow };
        }
      }),

      signUpOidc: builder.mutation<
        unknown,
        {
          flow: SelfServiceFlow;
          provider: OryProvider;
          googleHintEmail?: string;
          transient_payload?: Record<string, unknown>;
        }
      >({
        queryFn: async ({ flow, provider, googleHintEmail, transient_payload = {} }) => {
          try {
            const { loginService, providerId } = OidcProviderMapping[provider];
            await frontendApi.updateRegistrationFlow({
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
              if (googleHintEmail) {
                const paramsObj = { login_hint: googleHintEmail };
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

      signUp: builder.mutation<
        Identity,
        {
          flow: SelfServiceFlow;
          email: string;
          password: string;
          name: string;
          platform?: string;
          anonymousUserId?: string;
        }
      >({
        query: data => ({
          url: 'auth/sign-up',
          method: 'POST',
          body: data
        })
      }),

      logout: builder.mutation({
        query: () => ({
          url: 'auth/sign-out',
          method: 'POST'
        })
      }),

      signUpWithInvitation: builder.mutation<void, SignUpWithInvitationPayload>({
        invalidatesTags: ['identity'],
        query: data => ({
          url: 'auth/sign-up-invitation',
          method: 'POST',
          body: data
        })
      }),

      getCurrentUser: builder.query<IUser, void>({
        query: () => ({
          url: 'user/get-current-user',
          method: 'GET'
        })
      }),
      getOrganizationAndTeamOwner: builder.mutation<
        {
          organizationOwner: IOrganization[];
          teamOwner: (Omit<ITeam, 'belongsTo'> & { belongsTo: IOrganization })[];
        },
        void
      >({
        query: () => ({
          url: 'user/get-organization-team-owner',
          method: 'GET'
        })
      }),
      forceLogout: builder.mutation<unknown, { type: ForceLogoutType }>({
        query: data => ({
          url: 'auth/force-log-out',
          method: 'POST',
          body: data
        })
      }),
      updateUserIdentityId: builder.mutation({
        query: () => ({
          url: 'user/update-identityId',
          method: 'POST'
        })
      }),
      useGetCannyRedirectUrl: builder.query<{ url: string }, { redirectTo: string }>({
        query: ({ redirectTo }) => {
          // For newest profile data, we need to remove current token, new token will be forced to create in `prepareHeaders`
          localStorage.removeItem('token');
          return { url: 'auth/get-canny-redirect-url?redirect=' + encodeURIComponent(redirectTo) };
        }
      }),
      getRecoveryFlow: builder.query<RecoveryFlow, string>({
        queryFn: async id => {
          const { data: flow } = await frontendApi.getRecoveryFlow({
            flowId: id
          });
          return { data: flow };
        }
      }),
      forgetLastAccessAccount: builder.mutation<void, void>({
        query: () => ({
          url: 'auth/forget-last-access-account',
          method: 'POST'
        })
      }),
      getRegistrationFlow: builder.query<RegistrationFlow | undefined, string>({
        queryFn: async id => {
          if (!id) {
            return { data: undefined };
          }
          const { data: flow } = await frontendApi.getRegistrationFlow({
            flowId: id
          });
          return { data: flow };
        }
      })
    };
  }
});

export const {
  useLogoutMutation,
  useEnsureRegistrationFlowMutation,
  useSignUpOidcMutation,
  useEnsureRecoveryFlowMutation,
  useRecoverPasswordMutation,
  useSignUpWithInvitationMutation,
  useGetCurrentUserQuery,
  useGetOrganizationAndTeamOwnerMutation,
  useForceLogoutMutation,
  useUpdateUserIdentityIdMutation,
  useSignUpMutation,
  useUseGetCannyRedirectUrlQuery,
  useGetRecoveryFlowQuery,
  useForgetLastAccessAccountMutation,
  useGetRegistrationFlowQuery
} = accountApi;
