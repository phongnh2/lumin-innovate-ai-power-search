import { SettingsFlow } from '@ory/client';

import { ErrorCode } from '@/constants/errorCode';
import { OryProvider, OryUpdateSettingsMethod, SelfServiceFlow, Traits } from '@/interfaces/ory';
import { IUser } from '@/interfaces/user';
import { BaseException } from '@/lib/exceptions/base.exception';
import { constructFlowCsrfToken, frontendApi } from '@/lib/ory';

import { api } from '../api-slice';

import { identityApi } from './identity-api-slice';

const settingsApi = api.injectEndpoints({
  endpoints: builder => ({
    // init new settings flow when the old one is no more valid
    ensureSettingsFlow: builder.mutation<SelfServiceFlow, { initial?: SelfServiceFlow; returnTo?: string }>({
      queryFn: async ({ initial, returnTo }) => {
        if (initial) {
          // use existing not-expired flow
          const expired = new Date(initial.expires_at as string) <= new Date();
          if (!expired) {
            return { data: initial };
          }
        }

        // init new flow
        const { data: flow } = await frontendApi.createSettingsFlow({
          returnTo
        });
        return { data: flow };
      }
    }),

    submitChangePasswordFlow: builder.mutation<{ flow: SelfServiceFlow; newPassword: string }, { flow: SelfServiceFlow; newPassword: string }>({
      queryFn: async ({ flow, newPassword }) => {
        try {
          await frontendApi.updateSettingsFlow({
            flowId: flow.id,
            body: {
              csrf_token: constructFlowCsrfToken(flow),
              method: OryUpdateSettingsMethod.Password,
              password: newPassword
            }
          });
          return { data: { flow, newPassword } };
        } catch (err) {
          const error = err as BaseException;
          return {
            error: {
              status: error.getStatus(),
              data: error.getResponseError()
            }
          };
        }
      }
    }),

    updateTraits: builder.mutation<Traits, { flow: SelfServiceFlow; traits: Traits }>({
      invalidatesTags: ['identity'],
      queryFn: async ({ flow, traits }) => {
        try {
          const result = await frontendApi.updateSettingsFlow({
            flowId: flow.id,
            body: {
              method: OryUpdateSettingsMethod.Profile,
              csrf_token: constructFlowCsrfToken(flow),
              traits
            }
          });
          return { data: result.data.identity.traits };
        } catch (err) {
          const error = err as BaseException;
          return {
            error: {
              status: error.getStatus(),
              data: error.getResponseError()
            }
          };
        }
      }
    }),

    uploadAvatar: builder.mutation<{ remotePath: string }, Blob>({
      invalidatesTags: ['identity'],
      query: (file: Blob) => {
        const form = new FormData();
        form.append('file', file);

        return {
          url: 'user/upload-avatar',
          method: 'PATCH',
          body: form,
          forceNewToken: true
        };
      }
    }),

    removeAvatar: builder.mutation<void, void>({
      query: () => {
        return {
          url: 'user/remove-avatar',
          method: 'PATCH',
          forceNewToken: true
        };
      },
      onQueryStarted: (_, { dispatch, queryFulfilled }) => {
        const result = dispatch(
          // eslint-disable-next-line no-void
          identityApi.util.updateQueryData('getIdentity', void 0, draft => {
            if (draft == null) {
              return;
            }
            // eslint-disable-next-line no-param-reassign
            draft.traits.avatarRemoteId = '';
          })
        );
        queryFulfilled.catch(result.undo);
      }
    }),

    deleteAccount: builder.mutation<IUser, void>({
      query: () => ({
        url: 'user/delete-account',
        method: 'POST'
      })
    }),
    /**
     * @deprecated
     */
    reactivateAccount: builder.mutation<IUser, void>({
      query: () => ({
        url: 'user/reactivate-account',
        method: 'PATCH'
      })
    }),
    linkAccount: builder.mutation<Traits | null, { flow: SettingsFlow; provider: OryProvider; loginHint: string }>({
      queryFn: async ({ flow, provider, loginHint }) => {
        try {
          const result = await frontendApi.updateSettingsFlow({
            flowId: flow.id,
            body: {
              method: OryUpdateSettingsMethod.Oidc,
              csrf_token: constructFlowCsrfToken(flow),
              link: provider,
              upstream_parameters: {
                login_hint: loginHint
              }
            }
          });
          return { data: result.data.identity.traits };
        } catch (e) {
          const err = e as BaseException;
          const { code, meta } = err.getResponseError();
          if (code === ErrorCode.Auth.BROWSER_LOCATION_CHANGE_REQUIRED) {
            window.location.href = meta?.redirect_browser_to as string;
            return { data: null };
          }
          return {
            error: {
              status: err.getStatus(),
              data: err.getResponseError()
            }
          };
        }
      }
    }),
    confirmLinkAccount: builder.mutation<IUser, void>({
      query: () => ({
        url: 'user/confirm-link-account',
        method: 'POST'
      })
    }),
    linkSamlAccount: builder.mutation<Traits | null, { flow: SettingsFlow; provider: string }>({
      queryFn: async ({ flow, provider }) => {
        try {
          const result = await frontendApi.updateSettingsFlow({
            flowId: flow.id,
            body: {
              method: OryUpdateSettingsMethod.Saml,
              csrf_token: constructFlowCsrfToken(flow),
              link: provider
            }
          });
          return { data: result.data.identity.traits };
        } catch (e) {
          const err = e as BaseException;
          const { code, meta } = err.getResponseError();
          if (code === ErrorCode.Auth.BROWSER_LOCATION_CHANGE_REQUIRED) {
            window.location.href = meta?.redirect_browser_to as string;
            return { data: null };
          }
          throw err;
        }
      }
    })
  })
});

export const {
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useUpdateTraitsMutation,
  useEnsureSettingsFlowMutation,
  useDeleteAccountMutation,
  /**
   * @deprecated
   */
  useReactivateAccountMutation,
  useLinkAccountMutation,
  useConfirmLinkAccountMutation,
  useSubmitChangePasswordFlowMutation,
  useLinkSamlAccountMutation
} = settingsApi;

export default settingsApi;
