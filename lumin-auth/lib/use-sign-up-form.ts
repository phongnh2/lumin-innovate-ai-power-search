/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sonarjs/cognitive-complexity */
import { useRouter } from 'next/router';
import { BaseSyntheticEvent, useEffect, useRef } from 'react';

import { ElementName, QUERY_KEYS } from '@/constants/common';
import { Platforms } from '@/constants/platform';
import { OAUTH2_CHALLENGE } from '@/constants/sessionKey';
import { SIGN_AUTH_METHOD } from '@/constants/signAuthMethod';
import { SOCKET_EMIT } from '@/constants/socket';
import { DEFAULT_RETURN_TO_VALUE } from '@/constants/url';
import { useEnsureRegistrationFlowMutation, useSignUpOidcMutation, useSignUpMutation } from '@/features/account/account-api-slice';
import { setVerificationEmail } from '@/features/account/account-slice';
import { setLoginChallenge } from '@/features/oauth2/oauth2-slice';
import { closeElement, openElement } from '@/features/visibility-slice';
import { useGetQueryValuesFromReturnTo } from '@/hooks';
import useVerifyAuthencationMethod from '@/hooks/useVerifyAuthenticationMethod';
import { OryProvider } from '@/interfaces/ory';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useForm } from '@/lib/react-hook-form';
import { getVerificationEmail, getLoginChallenge } from '@/selectors';
import CookieUtils from '@/utils/cookie.utils';

import { authEvent } from './factory/auth.event';
import { buttonEvent } from './factory/button.event';
import socket from './socket';
import { signUpSchema } from './yup';
import { getAnonymousUserId } from './factory/utils';

export const useSignUpForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    returnToValue,
    returnToParams: { from, agGuest }
  } = useGetQueryValuesFromReturnTo();

  const returnToValueRef = useRef(returnToValue);
  useEffect(() => {
    returnToValueRef.current = returnToValue;
  }, [returnToValue]);

  const [ensureFlow, { data: flow, error: errEnsureFlow }] = useEnsureRegistrationFlowMutation();
  const [signUp, { isSuccess: signUpSuccess, error: errSignUp, data }] = useSignUpMutation();
  const { flow: flowQuery, from: fromQuery, platform } = router.query;
  const { error: errVerifyMethod } = useVerifyAuthencationMethod(flowQuery as string);
  const [signUpOidc, { error: signUpOidcError }] = useSignUpOidcMutation();
  const { register, handleSubmit, watch, getValues, formState } = useForm<FormData>({
    schema: signUpSchema
  });
  const verificationEmail = useAppSelector(getVerificationEmail);
  const loginChallenge = useAppSelector(getLoginChallenge) || '';
  const { errors } = formState;

  const currentReturnTo = returnToValueRef.current || returnToValue;
  const returnTo = currentReturnTo || DEFAULT_RETURN_TO_VALUE;
  const flowId = flowQuery ? String(flowQuery) : null;

  const signUpRef = currentReturnTo ? encodeURIComponent(currentReturnTo) : '';

  const getFromAttributes = () => {
    try {
      if (fromQuery) {
        return fromQuery as string;
      }

      if (from) {
        return from;
      }

      return undefined;
    } catch (e) {
      return undefined;
    }
  };

  // init flow
  useEffect(() => {
    ensureFlow({
      initialId: flowId,
      returnTo,
      ref: signUpRef
    });
  }, [ensureFlow, flowId, returnTo, loginChallenge, signUpRef]);

  // handle signup success
  useEffect(() => {
    if (signUpSuccess) {
      authEvent.signUp({ method: SIGN_AUTH_METHOD.UserName, oryIdentityId: data?.id, from: getFromAttributes(), agGuest });
      dispatch(setVerificationEmail(getValues('email')));
    }
  }, [signUpSuccess]);

  useEffect(() => {
    const url = new URL('/verify-account', window.location.origin);
    if (signUpRef) {
      url.searchParams.set('ref', signUpRef);
    }

    if (currentReturnTo) {
      url.searchParams.set(QUERY_KEYS.RETURN_TO, currentReturnTo);
    }

    if (loginChallenge) {
      url.searchParams.set('login_challenge', loginChallenge);
    }
    if (verificationEmail) {
      router.replace(url);
      dispatch(closeElement(ElementName.LUMIN_LOADING));
    }
  }, [verificationEmail]);

  useEffect(() => {
    if (errSignUp || errVerifyMethod || signUpOidcError) {
      if ((errVerifyMethod as any)?.data?.meta?.loginChallenge) {
        dispatch(setLoginChallenge((errVerifyMethod as any).data.meta.loginChallenge));
      }
      dispatch(closeElement(ElementName.LUMIN_LOADING));
    }
  }, [errSignUp, errVerifyMethod, signUpOidcError]);

  const getPlatformByQuery = (): Platforms | undefined => {
    if (!platform || typeof platform !== 'string') {
      return;
    }
    return platform as Platforms;
  };

  // sign up with password and redirect to email verification page if succeeds
  const submitSignUp = handleSubmit(async form => {
    dispatch(openElement(ElementName.LUMIN_LOADING));
    const newFlow = await ensureFlow({
      initial: flow,
      returnTo,
      ref: signUpRef
    }).unwrap();

    await signUp({
      flow: newFlow,
      name: form.name,
      email: form.email,
      password: form.password,
      platform: getPlatformByQuery(),
      anonymousUserId: getAnonymousUserId()
    });
  });

  const signInOidc = (provider: OryProvider, googleHintEmail?: string) => async (e: BaseSyntheticEvent | null) => {
    dispatch(openElement(ElementName.LUMIN_LOADING));
    if (e) {
      buttonEvent.signInOidc({ e, isSignIn: false });
    }
    if (loginChallenge) {
      sessionStorage.setItem(OAUTH2_CHALLENGE, loginChallenge);
    }
    // read from ref to avoid stale closure
    const latestReturnTo = returnToValueRef.current || returnToValue || DEFAULT_RETURN_TO_VALUE;
    const newFlow = await ensureFlow({ initial: flow, returnTo: latestReturnTo }).unwrap();

    await signUpOidc({
      flow: newFlow,
      provider,
      googleHintEmail,
      transient_payload: {
        loginChallenge,
        platform: getPlatformByQuery(),
        userAgent: navigator.userAgent,
        anonymousUserId: getAnonymousUserId(),
      }
    });
    CookieUtils.setAuthEventCookie(SIGN_AUTH_METHOD[provider], { from: (from as string) || getFromAttributes(), agGuest });
    socket.emit(SOCKET_EMIT.User.SignIn);
  };

  return {
    watch,
    errors,
    register,
    submitSignUp,
    signInOidc,
    formState,
    serverError: errSignUp || (errVerifyMethod as any) || errEnsureFlow,
    getValues
  };
};

type FormData = {
  email: string;
  password: string;
  name: string;
  terms?: boolean | undefined;
  // only for defining errors without an input ref
  // (like email exists error)
  /**
   * @deprecated
   */
  misc?: string;
  notice?: string;
};
