import { VerificationFlow } from '@ory/client';

import { SelfServiceFlow } from '@/interfaces/ory';
import { constructFlowCsrfToken, frontendApi } from '@/lib/ory';

import { api } from '../api-slice';

const verificationApi = api.injectEndpoints({
  endpoints: builder => ({
    getVerificationFlow: builder.query<VerificationFlow | null, string | null>({
      queryFn: async id => {
        if (id == null) {
          return { data: null };
        }
        const { data: flow } = await frontendApi.getVerificationFlow({
          flowId: id
        });
        return { data: flow };
      }
    }),

    // init new verification flow when the old one is no more valid
    ensureVerificationFlow: builder.mutation<
      SelfServiceFlow,
      { initial?: SelfServiceFlow; returnTo?: string; ref?: string | string[]; loginChallenge?: string | string[] }
    >({
      queryFn: async ({ initial, returnTo, ref, loginChallenge }) => {
        if (initial) {
          if (!initial.expires_at) {
            return { data: initial };
          }

          // use existing not-expired flow
          const expired = new Date(initial.expires_at) <= new Date();
          if (!expired) {
            return { data: initial };
          }
        }

        // init new flow
        const { data: flow } = await frontendApi.createVerificationFlow(
          {
            returnTo
          },
          {
            params: {
              ref,
              login_challenge: loginChallenge
            }
          }
        );
        return { data: flow };
      }
    }),

    submitVerificationFlow: builder.mutation<null, { flow: SelfServiceFlow; email: string }>({
      queryFn: async ({ flow, email }) => {
        await frontendApi.updateVerificationFlow({
          flowId: flow.id,
          body: {
            csrf_token: constructFlowCsrfToken(flow),
            email
          }
        });
        return { data: null };
      }
    }),

    resendVerificationLink: builder.mutation<null, { flow: SelfServiceFlow; email: string }>({
      query: ({ email, flow }) => {
        return {
          url: 'auth/resend-verification-link',
          method: 'POST',
          body: {
            email,
            flow
          }
        };
      }
    })
  })
});

export const { useEnsureVerificationFlowMutation, useSubmitVerificationFlowMutation, useGetVerificationFlowQuery, useResendVerificationLinkMutation } =
  verificationApi;
