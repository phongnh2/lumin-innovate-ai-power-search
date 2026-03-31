import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/router';
import { BaseSyntheticEvent, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { environment } from '@/configs/environment';
import { ElementName } from '@/constants/common';
import { EventCookieKey } from '@/constants/cookieKey';
import { LoggerReason } from '@/constants/logger';
import { SIGN_AUTH_METHOD } from '@/constants/signAuthMethod';
import { useEnsureRegistrationFlowMutation, useSignUpWithInvitationMutation } from '@/features/account/account-api-slice';
import { setVerificationEmail } from '@/features/account/account-slice';
import { useEnsureLoginFlowMutation, useLoginOidcMutation } from '@/features/account/sign-in-api-slice';
import { closeElement, openElement } from '@/features/visibility-slice';
import { THookFormSubmitHandler } from '@/interfaces/common';
import { OryProvider } from '@/interfaces/ory';
import { buttonEvent } from '@/lib/factory/button.event';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { clientLogger } from '@/lib/logger';
import { useForm } from '@/lib/react-hook-form';
import { signUpSchema, TSignUpSchema } from '@/lib/yup';
import { getVerificationEmail } from '@/selectors';
import CookieUtils from '@/utils/cookie.utils';
import { getFullPathWithLanguageFromUrl } from '@/utils/getLanguage';

type TSignUpOidc = (params: { provider: OryProvider; loginHint?: string }) => (e: BaseSyntheticEvent | null) => Promise<void>;

type TResult = {
  signUpPassword: THookFormSubmitHandler;
  register: UseFormReturn<TSignUpSchema>['register'];
  signUpWithGoogle: ({ credential }: { credential: string }) => Promise<void>;
  signUpOidc: TSignUpOidc;
  formState: UseFormReturn<TSignUpSchema>['formState'];
  serverError?: FetchBaseQueryError | SerializedError;
};

type TProps = {
  token: string;
  defaultValues: Partial<TSignUpSchema> & { email: string };
};

function useSignUp({ token, defaultValues }: TProps): TResult {
  const dispatch = useAppDispatch();
  const [ensureFlow, { data: loginFlow }] = useEnsureLoginFlowMutation();
  const [ensureRegistrationFlow, { data: signUpFlow, error: ensureSignUpError }] = useEnsureRegistrationFlowMutation();
  const [loginOidc] = useLoginOidcMutation();
  const [signUpWithInvitation, { error: signUpInviatationError }] = useSignUpWithInvitationMutation();
  const { handleSubmit, register, formState } = useForm<TSignUpSchema>({
    defaultValues,
    schema: signUpSchema
  });
  const router = useRouter();
  const verificationEmail = useAppSelector(getVerificationEmail);

  const getReturnToUrl = (): string => {
    const search = new URLSearchParams();
    search.append('token', token);
    const invitationUrl = new URL(`/?${search.toString()}`, environment.public.host.appUrl + getFullPathWithLanguageFromUrl());
    return invitationUrl.toString();
  };

  const signUpPassword = async (value: TSignUpSchema) => {
    try {
      dispatch(openElement(ElementName.LUMIN_LOADING));
      if (!token) {
        throw new Error('Unexpected call without token.');
      }
      const { return_to } = router.query;
      const signUpRef = return_to ? encodeURIComponent(String(return_to)) : '';
      const registrationFlow = await ensureRegistrationFlow({ initial: signUpFlow, ref: signUpRef }).unwrap();
      await signUpWithInvitation({
        flow: registrationFlow,
        name: value.name,
        token,
        password: value.password
      }).unwrap();
      const params = { method: SIGN_AUTH_METHOD.UserName, url: window.location.origin + window.location.pathname };
      CookieUtils.set({ name: EventCookieKey.USER_SIGN_UP_USERNAME_PASSWORD, value: JSON.stringify(params) });
      CookieUtils.setAuthEventCookie(SIGN_AUTH_METHOD.UserName);
      dispatch(setVerificationEmail(defaultValues.email));
    } catch (error: any) {
      dispatch(closeElement(ElementName.LUMIN_LOADING));
      clientLogger.error({
        message: error?.message,
        reason: LoggerReason.SIGN_UP_PASSWORD,
        attributes: {
          logger: JSON.stringify(error)
        }
      });
    }
  };

  const signUpOidc: TSignUpOidc = payload => async e => {
    const { provider, loginHint } = payload;
    if (e) {
      buttonEvent.signInOidc({ e, isSignIn: true });
    }
    const returnTo = getReturnToUrl();
    const newFlow = await ensureFlow({ initial: loginFlow, returnTo }).unwrap();
    await loginOidc({ flow: newFlow, provider, hintEmail: loginHint });
    CookieUtils.setAuthEventCookie(SIGN_AUTH_METHOD[provider]);
  };

  const signUpWithGoogle = async ({ credential }: { credential: string }) => {
    const decoded = jwtDecode(credential) as { email: string };
    await signUpOidc({ provider: OryProvider.Google, loginHint: decoded.email })(null);
  };

  useEffect(() => {
    const url = new URL('/verify-account', window.location.origin);
    if (verificationEmail) {
      router.replace(url);
      dispatch(closeElement(ElementName.LUMIN_LOADING));
    }
  }, [verificationEmail]);

  return {
    signUpPassword: handleSubmit(signUpPassword),
    signUpWithGoogle,
    signUpOidc,
    register,
    formState,
    serverError: (signUpInviatationError || ensureSignUpError) as any
  };
}

export default useSignUp;
