/* eslint-disable @typescript-eslint/no-explicit-any */
import { css } from '@emotion/react';
import jwtDecode from 'jwt-decode';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { Trans } from 'next-i18next';
import { BaseSyntheticEvent, useEffect, useMemo, useState, useRef } from 'react';

import Form from '@/components/Form';
import { Header } from '@/components/Header';
import AuthMethodDivider from '@/components/SignAuth/AuthMethodDivider';
import SocialAuthGroup from '@/components/SignAuth/SocialAuthGroup';
import { environment } from '@/configs/environment';
import { Routes } from '@/configs/routers';
import { ButtonName } from '@/constants/buttonEvent';
import { ElementName, QUERY_KEYS } from '@/constants/common';
import { ErrorCode } from '@/constants/errorCode';
import { CommonErrorMessage } from '@/constants/errorMessage';
import { FORM_FIELD } from '@/constants/formField';
import { FormName } from '@/constants/formName';
import { LANGUAGES } from '@/constants/language';
import { LoggerReason } from '@/constants/logger';
import { Platforms } from '@/constants/platform';
import { OAUTH2_CHALLENGE } from '@/constants/sessionKey';
import { SIGN_AUTH_METHOD } from '@/constants/signAuthMethod';
import { SOCKET_EMIT } from '@/constants/socket';
import { CANNY_AUTH_REGEX } from '@/constants/url';
import { useEnsureLoginFlowMutation, useGetLoginFlowQuery, useLoginOidcMutation, useLoginPasswordMutation } from '@/features/account/sign-in-api-slice';
import { getServerError, isFrontendApiError, isSerializedError } from '@/features/errors';
import { setLoginChallenge } from '@/features/oauth2/oauth2-slice';
import { closeElement, openElement } from '@/features/visibility-slice';
import { useFetchUserLocation, useGetQueryValuesFromReturnTo } from '@/hooks';
import { useHandleFlowErrors } from '@/hooks/auth';
import useTranslation from '@/hooks/useTranslation';
import { LastAccessAccount } from '@/interfaces/account';
import { OryProvider, SelfServiceFlow } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import { buttonEvent } from '@/lib/factory/button.event';
import { getAnonymousUserId } from '@/lib/factory/utils';
import { useAppDispatch } from '@/lib/hooks';
import { clientLogger } from '@/lib/logger';
import { useForm } from '@/lib/react-hook-form';
import socket from '@/lib/socket';
import { signInSchema, TSignInSchema } from '@/lib/yup';
import { PasswordInput, Input, Text, VerticalGap, Alert, ButtonText } from '@/ui';
import { ButtonSize } from '@/ui/Button';
import { isClientSide } from '@/utils/commonUtils';
import CookieUtils from '@/utils/cookie.utils';
import { getErrorMessage, getErrorMessageTranslated } from '@/utils/error.utils';
import { getFullPathWithLanguageFromUrl } from '@/utils/getLanguage';
import { isGoogleOpenPath } from '@/utils/openGoogle.utils';

import { titleCss } from '../Layout/LayoutSignAuth/LayoutSignAuth.styled';
import * as Styled from '../SignAuth/Auth.styled';
import LastAccessAccountComponent from '../SignAuth/LastAccessAccount/LastAccessAccount';
import { ResendVerificationLink } from '../SignAuth/ResendVerification';

const HeaderSignUpElement = dynamic(() => import('@/components/HeaderSignUpElement'), { ssr: false });

type OAuth2Props = {
  from: string;
  challenge: string;
  returnTo: string;
};

type SignInPageProps = {
  oauth2?: OAuth2Props;
  platform?: Platforms;
  lastAccessAccount?: LastAccessAccount;
};

function handleReturnTo({
  router,
  getReturnTo,
  email,
  provider
}: {
  router: NextRouter;
  getReturnTo: () => string | undefined;
  email: string;
  provider?: OryProvider;
}) {
  const gateWay = environment.public.host.authUrl + getFullPathWithLanguageFromUrl('/authentication/gateway');
  let returnTo = getReturnTo();
  const loginHint = router.query[QUERY_KEYS.LOGIN_HINT] as string;
  const searchParams = new URLSearchParams();

  if (loginHint && isGoogleOpenPath(returnTo as string)) {
    if ([OryProvider.Dropbox, OryProvider.Microsoft].includes(provider as OryProvider)) {
      searchParams.append('redirect_to', `${returnTo}&guestEmail=${loginHint}`);
      return gateWay + `?` + searchParams.toString();
    }
    if (decodeURIComponent(loginHint) !== email) {
      return gateWay;
    }
    if (provider === OryProvider.Google) {
      const urlParams = new URLSearchParams(returnTo);
      searchParams.append('redirect_to', urlParams.get(QUERY_KEYS.RETURN_TO) as string);
      return gateWay + `?` + searchParams.toString();
    }
  }
  if (router.asPath.match(CANNY_AUTH_REGEX)) {
    const cannyRedirectUrl = router.query[QUERY_KEYS.REDIRECT];
    returnTo = `${environment.public.host.authUrl}/authentication/canny?redirect=${cannyRedirectUrl}`;
  }

  const isAutoTriggeredXero = provider === OryProvider.Xero && (router.query[QUERY_KEYS.PROVIDER] as string)?.toLowerCase() === 'xero';

  if (isAutoTriggeredXero && returnTo) {
    const redirectTo = new URL(returnTo, environment.public.host.appUrl);
    redirectTo.searchParams.append(QUERY_KEYS.FROM_XERO_APP_STORE, 'true');
    returnTo = redirectTo.toString();
  }

  searchParams.append('redirect_to', returnTo || '');
  return gateWay + '?' + searchParams.toString() || '';
}

function SignInPage({ oauth2, platform, lastAccessAccount }: SignInPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // api
  const [ensureLoginFlow, { data: loginFlow }] = useEnsureLoginFlowMutation();
  const [loginPassword, { isSuccess: loginOk, error: serverError }] = useLoginPasswordMutation();
  const [loginOidc, { error: loginOidcError }] = useLoginOidcMutation();

  // state
  const returnToQuery = router.query[QUERY_KEYS.RETURN_TO] as string;
  const emailQuery = router.query[QUERY_KEYS.EMAIL] as string;
  const loginFlowId = router.query[QUERY_KEYS.FLOW] as string;
  const providerQuery = router.query[QUERY_KEYS.PROVIDER] as string;
  const [showLastAccessAccount, setShowLastAccessAccount] = useState(
    !emailQuery && !!lastAccessAccount && (lastAccessAccount?.loginService as LoginService) !== LoginService.XERO && !loginFlowId
  );

  const { data: existingLoginFlow } = useGetLoginFlowQuery(loginFlowId);
  useHandleFlowErrors({ existingFlow: existingLoginFlow });

  // use ref to store the current existingLoginFlow value to avoid closure issues
  const existingLoginFlowRef = useRef(existingLoginFlow);

  const [signInAlternativeMessage, setSignInAlternativeMessage] = useState<string | undefined>(undefined);

  useFetchUserLocation();
  const queryParamValues = returnToQuery ? `?${QUERY_KEYS.RETURN_TO}=${encodeURIComponent(returnToQuery)}` : '';
  const forgotPasswordUrl = `/forgot-password${queryParamValues}`;
  const {
    returnToValue,
    returnToParams: { from, agGuest }
  } = useGetQueryValuesFromReturnTo();

  // fix the stale closure issue
  const returnToValueRef = useRef(returnToValue);
  useEffect(() => {
    returnToValueRef.current = returnToValue;
  }, [returnToValue]);

  const form = useForm<TSignInSchema>({
    defaultValues: {
      email: emailQuery
    },
    schema: signInSchema
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted, isSubmitting },
    getValues
  } = form;

  const credentialQuery = router.query[QUERY_KEYS.CREDENTIAL];

  // update ref whenever existingLoginFlow changes
  useEffect(() => {
    existingLoginFlowRef.current = existingLoginFlow;
  }, [existingLoginFlow]);

  function toggleOpenLastAccess() {
    setShowLastAccessAccount(prev => !prev);
  }

  const getReturnTo = () => {
    if (oauth2?.returnTo) {
      return oauth2.returnTo;
    }
    // for mobile authentication
    if (isClientSide()) {
      const oauth2Challenge = sessionStorage.getItem(OAUTH2_CHALLENGE);
      if (oauth2Challenge) {
        return `${environment.public.host.authUrl}/oauth2/sign-in?login_challenge=${oauth2Challenge}`;
      }
    }

    return returnToValueRef.current ?? returnToValue ?? undefined;
  };

  const fromValue = oauth2?.from || from || null;

  const clickSignInOidc = (provider: OryProvider, hintEmail?: string) => async (e: BaseSyntheticEvent | null) => {
    try {
      dispatch(openElement(ElementName.LUMIN_LOADING));
      if (e) {
        buttonEvent.signInOidc({ e, isSignIn: true });
      }
      CookieUtils.setAuthEventCookie(SIGN_AUTH_METHOD[provider], { from: fromValue, agGuest });

      // access existingLoginFlow at execution time using ref to avoid closure issues
      const currentExistingLoginFlow = existingLoginFlowRef.current;

      let flow: SelfServiceFlow | undefined = currentExistingLoginFlow;
      if (!flow) {
        flow = await ensureLoginFlow({
          returnTo: handleReturnTo({ router, getReturnTo, email: hintEmail as string, provider }),
          refresh: true
        }).unwrap();
      }

      if (oauth2) {
        sessionStorage.setItem(OAUTH2_CHALLENGE, oauth2.challenge);
      }
      await loginOidc({
        flow,
        provider,
        hintEmail,
        transient_payload: {
          platform,
          userAgent: navigator.userAgent,
          anonymousUserId: getAnonymousUserId()
        }
      });
      socket.emit(SOCKET_EMIT.User.SignIn);
    } catch (error) {
      clientLogger.error({
        message: getErrorMessage(error),
        reason: LoggerReason.SIGN_IN_OIDC,
        attributes: { provider }
      });
      dispatch(closeElement(ElementName.LUMIN_LOADING));
      throw error;
    }
  };

  const _handleGoogleSignInResponse = async ({ credential }: { credential: string }) => {
    const decoded = jwtDecode(credential) as { email: string };

    clickSignInOidc(OryProvider.Google, decoded.email)(null);
  };

  // ensure login flow exists
  useEffect(() => {
    if (!loginFlowId) {
      ensureLoginFlow({ returnTo: getReturnTo() });
    }
  }, [ensureLoginFlow, loginFlowId]);

  useEffect(() => {
    if (oauth2) {
      dispatch(setLoginChallenge(oauth2.challenge));
    }
  }, [dispatch, oauth2]);

  const onLoginPassword = handleSubmit(async ({ email, password }) => {
    dispatch(openElement(ElementName.LUMIN_LOADING));
    let flow: SelfServiceFlow | undefined = existingLoginFlow;
    if (!flow) {
      flow = await ensureLoginFlow({
        returnTo: handleReturnTo({ router, getReturnTo, email: email }),
        refresh: true
      }).unwrap();
    }

    setSignInAlternativeMessage(undefined);
    await loginPassword({
      flow,
      email: email,
      password: password
    });
    CookieUtils.setAuthEventCookie(SIGN_AUTH_METHOD.UserName, { from: fromValue, agGuest });
  });

  // handle sign in with google from lumin static pages
  useEffect(() => {
    if (credentialQuery) {
      _handleGoogleSignInResponse({ credential: String(credentialQuery) });
    }
  }, [credentialQuery]);

  // auto-trigger sign-in based on provider query param
  useEffect(() => {
    if (!providerQuery) {
      return;
    }

    // only support xero for now
    const providerMap: Record<string, OryProvider> = {
      xero: OryProvider.Xero
    };

    const provider = providerMap[providerQuery.toLowerCase()];
    if (provider) {
      clickSignInOidc(provider)(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerQuery]);

  useEffect(() => {
    if (loginOk) {
      socket.emit(SOCKET_EMIT.User.SignIn);
      if (oauth2?.returnTo) {
        window.location.href = handleReturnTo({ router, getReturnTo, email: '' });
        return;
      }
      if (loginFlow?.return_to) {
        window.location.href = loginFlow.return_to;
      } else {
        window.location.href = Routes.Root;
      }
    }
  }, [loginOk]);

  useEffect(() => {
    if (serverError || (Boolean(oauth2?.from === 'mobile') && loginOidcError)) {
      dispatch(closeElement(ElementName.LUMIN_LOADING));
    }
  }, [serverError, loginOidcError, oauth2?.from]);

  // handle validation error

  const getServerErrorMessage = () => {
    if (signInAlternativeMessage) {
      return signInAlternativeMessage;
    }

    if (!serverError) {
      return null;
    }
    if (!isSerializedError<{ loginService?: LoginService; remainingTime?: number }>(serverError)) {
      if (isFrontendApiError(serverError as any)) {
        const mappingError = getServerError(serverError as any, t);
        return mappingError[(serverError as any).code] || (serverError as any).message;
      }
      return t(CommonErrorMessage.Common.SOMETHING_WENT_WRONG);
    }
    const errorMapping = {
      [ErrorCode.User.UNACTIVATED_ACCOUNT]: (
        <>
          {t('authPage.resendVerifyYourEmail')}
          <br />
          <ResendVerificationLink formValues={getValues} countdownFrom={serverError?.data?.meta?.remainingTime as unknown as number} />
        </>
      ),
      [ErrorCode.User.PASSWORD_EXPIRED]: (
        <>
          <Trans
            i18nKey='errorMessage.passwordExpiredHasLink'
            components={{ a: <ButtonText onClick={() => router.push(forgotPasswordUrl)} underline level={6} /> }}
          />
        </>
      ),
      ...getServerError(serverError, t)
    };
    return errorMapping[serverError.data.code] || serverError.data.message;
  };

  const title = useMemo(() => {
    const languageCodes = Object.values(LANGUAGES).join('|');
    const inviteLinkPattern = new RegExp(`${environment.public.host.appUrl}(/(${languageCodes}))?/invite-link/`);
    return returnToQuery?.match(inviteLinkPattern) ? t('common.signInToJoinOrganization') : t('common.signIn');
  }, [returnToQuery]);

  useEffect(() => {
    if (!existingLoginFlow) {
      return;
    }
    const message = existingLoginFlow.ui.messages?.[0]?.text;
    setSignInAlternativeMessage(message);
  }, [existingLoginFlow]);

  if (showLastAccessAccount && lastAccessAccount) {
    return (
      <>
        <Text as={'h1'} bold css={titleCss}>
          {title}
        </Text>
        <Header />
        <LastAccessAccountComponent
          form={form}
          returnTo={getReturnTo()}
          from={oauth2?.from}
          platform={platform}
          forgotPasswordUrl={forgotPasswordUrl}
          lastAccessAccount={lastAccessAccount}
          serverErrorMessage={getServerErrorMessage()}
          toggleOpenLastAccess={toggleOpenLastAccess}
          clickSignInOidc={clickSignInOidc}
          clickSignInPassword={onLoginPassword}
        />
      </>
    );
  }

  return (
    <>
      <Text as={'h1'} bold css={titleCss}>
        {title}
      </Text>
      <Header />

      <div>
        <Alert
          css={css`
            margin-bottom: 16px;
          `}
          show={Boolean(getServerErrorMessage()) && (isSubmitted || Boolean(signInAlternativeMessage))}
        >
          {getServerErrorMessage()}
        </Alert>

        <SocialAuthGroup
          handleGoogleSignInResponse={_handleGoogleSignInResponse}
          onDropboxClick={clickSignInOidc(OryProvider.Dropbox)}
          onAppleClick={clickSignInOidc(OryProvider.Apple)}
          isSignUp={false}
          fromOAuth2={Boolean(oauth2?.from === 'mobile')}
          onGoogleClick={clickSignInOidc(OryProvider.Google)}
          onMicrosoftClick={clickSignInOidc(OryProvider.Microsoft)}
          onXeroClick={clickSignInOidc(OryProvider.Xero)}
        />

        <AuthMethodDivider />

        <Form data-lumin-form-name={FormName.SIGN_IN_FORM} onSubmit={onLoginPassword}>
          {oauth2 && (
            <>
              <input type='hidden' name='challenge' value={oauth2.challenge} readOnly />
            </>
          )}

          <VerticalGap level={4}>
            <Input
              {...register('email')}
              type='email'
              icon='email'
              placeholder={t('placeholder.yourEmail')}
              autoComplete='email'
              error={getErrorMessageTranslated(errors.email?.message, t)}
              inputData={{
                'data-lumin-name': FORM_FIELD.SIGNIN.EMAIL.name,
                'data-lumin-purpose': FORM_FIELD.SIGNIN.EMAIL.purpose
              }}
            />

            <PasswordInput
              {...register('password')}
              placeholder={t('placeholder.yourPassword')}
              autoComplete='current-password'
              error={getErrorMessageTranslated(errors.password?.message, t)}
              inputData={{
                'data-lumin-name': FORM_FIELD.SIGNIN.PASSWORD.name,
                'data-lumin-purpose': FORM_FIELD.SIGNIN.PASSWORD.purpose
              }}
            />
          </VerticalGap>
          <Styled.ForgotPassword>
            <Text as={Link} bold underline href={forgotPasswordUrl} className='underline'>
              {t('signInPage.forgotPassword')}
            </Text>
          </Styled.ForgotPassword>

          <Styled.SubmitButton type='submit' loading={isSubmitting} fullWidth data-lumin-btn-name={ButtonName.SIGN_IN_SUBMIT} size={ButtonSize.XL}>
            {t('common.signIn')}
          </Styled.SubmitButton>

          <HeaderSignUpElement returnTo={getReturnTo()} from={oauth2?.from} platform={platform} />
        </Form>
      </div>
    </>
  );
}

export default SignInPage;
