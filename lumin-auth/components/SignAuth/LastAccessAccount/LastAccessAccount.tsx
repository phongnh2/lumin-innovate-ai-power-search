import { Divider } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BaseSyntheticEvent, SyntheticEvent, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

import Form from '@/components/Form';
import SignUpFooter from '@/components/SignUpFooter/SignUpFooter';
import { environment } from '@/configs/environment';
import { Routes } from '@/configs/routers';
import { ButtonName } from '@/constants/buttonEvent';
import { FORM_FIELD } from '@/constants/formField';
import { FormName } from '@/constants/formName';
import { Platforms } from '@/constants/platform';
import { useForgetLastAccessAccountMutation } from '@/features/account/account-api-slice';
import useTranslation from '@/hooks/useTranslation';
import { LastAccessAccount } from '@/interfaces/account';
import { OryProvider } from '@/interfaces/ory';
import { LoginService } from '@/interfaces/user';
import LockIconSvg from '@/public/assets/lock.svg?url';
import GoogleIconSvg from '@/public/assets/logo-google.svg?url';
import { Avatar, Colors, Icomoon, PasswordInput, Text, Alert } from '@/ui';
import { ButtonColor, ButtonSize } from '@/ui/Button';
import AppleBlackSvgIcon from '@/ui/IconButton/images/logo-apple-black.svg?url';
import DropboxSvgIcon from '@/ui/IconButton/images/logo-dropbox.svg?url';
import MicrosoftSvgIcon from '@/ui/IconButton/images/logo-microsoft.svg?url';
import SsoIconSvg from '@/ui/IconButton/images/logo-sso-last-access.svg?url';
import { getErrorMessageTranslated } from '@/utils/error.utils';

import * as Styled from '../Auth.styled';

import {
  avatarCss,
  containerCss,
  LastAccessButton,
  LastAccessChildrenWrapper,
  plusIconContainerCss,
  subTextCss,
  logoContainerCss,
  RemoveButton,
  dividerCss,
  BackToSaveProfileButton,
  alertCss,
  textDividerCss,
  emailTextCss,
  emailTextContainerCss
} from './LastAccessButton.styled';

const IconMap = {
  [LoginService.GOOGLE]: GoogleIconSvg,
  [LoginService.EMAIL_PASSWORD]: LockIconSvg,
  [LoginService.APPLE]: AppleBlackSvgIcon,
  [LoginService.MICROSOFT]: MicrosoftSvgIcon,
  [LoginService.DROPBOX]: DropboxSvgIcon,
  [LoginService.SAML_SSO]: SsoIconSvg
};

type LastAccessAccountComponentProps = {
  serverErrorMessage?: string;
  lastAccessAccount: LastAccessAccount;
  forgotPasswordUrl: string;
  form: UseFormReturn<
    {
      email: string;
      password: string;
    },
    unknown
  >;
  returnTo?: string;
  from?: string;
  platform?: Platforms;
  toggleOpenLastAccess: () => void;
  clickSignInOidc: (provider: OryProvider, hintEmail?: string) => (e: BaseSyntheticEvent | null) => void;
  clickSignInPassword: () => void;
};

function LastAccessAccountComponent({
  serverErrorMessage,
  lastAccessAccount,
  form,
  forgotPasswordUrl,
  returnTo,
  from,
  platform,
  toggleOpenLastAccess,
  clickSignInOidc,
  clickSignInPassword
}: LastAccessAccountComponentProps) {
  const { t } = useTranslation();
  const avatarRemotePath =
    lastAccessAccount.avatarRemoteId && `${environment.public.host.backendUrl}/user/getAvatar?remoteId=${lastAccessAccount.avatarRemoteId}`;
  const [forgetLastAccessAccount] = useForgetLastAccessAccountMutation();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const {
    formState: { errors, isSubmitting, isSubmitted }
  } = form;
  const router = useRouter();

  const emailParts = lastAccessAccount.email.split('@');

  function forgetMethod(event: SyntheticEvent) {
    event.stopPropagation();
    forgetLastAccessAccount();
    toggleOpenLastAccess();
  }

  const clickLastSignIn = () => {
    if (!lastAccessAccount) return;
    switch (lastAccessAccount.loginService) {
      case LoginService.EMAIL_PASSWORD:
        setShowPasswordForm(true);
        form.setValue('email', lastAccessAccount.email);
        break;
      case LoginService.GOOGLE:
        clickSignInOidc(OryProvider.Google, lastAccessAccount.email)(null);
        break;
      case LoginService.MICROSOFT:
        clickSignInOidc(OryProvider.Microsoft, lastAccessAccount.email)(null);
        break;
      case LoginService.DROPBOX:
        clickSignInOidc(OryProvider.Dropbox, lastAccessAccount.email)(null);
        break;
      case LoginService.APPLE:
        clickSignInOidc(OryProvider.Apple, lastAccessAccount.email)(null);
        break;
      case LoginService.SAML_SSO:
        // navigate to sso page with loginHint query parameter
        router.push(`${Routes.SignInSSO}?loginHint=${encodeURIComponent(lastAccessAccount.email)}`);
        break;
    }
  };

  const getDataButtonName = () => {
    switch (lastAccessAccount.loginService) {
      case LoginService.GOOGLE:
        return ButtonName.SIGN_IN_GOOGLE;
      case LoginService.MICROSOFT:
        return ButtonName.SIGN_IN_MICROSOFT;
      case LoginService.DROPBOX:
        return ButtonName.SIGN_IN_DROPBOX;
      case LoginService.SAML_SSO:
        return ButtonName.SIGN_IN_SSO;
    }
  };

  const signInWithAnotherAccount = () => {
    form.reset();
    toggleOpenLastAccess();
  };

  return (
    <>
      <div>
        <Alert css={alertCss} show={Boolean(serverErrorMessage) && isSubmitted}>
          {serverErrorMessage}
        </Alert>
        <div css={containerCss} suppressHydrationWarning>
          <LastAccessButton
            icon={
              <div css={logoContainerCss}>
                <Image src={IconMap[lastAccessAccount.loginService]} alt={lastAccessAccount.loginService} />
              </div>
            }
            data-lumin-btn-name={getDataButtonName()}
            color={ButtonColor.SECONDARY_DARK}
            fullWidth
            onClick={clickLastSignIn}
            disabled={showPasswordForm}
          >
            <LastAccessChildrenWrapper>
              <Avatar src={avatarRemotePath} name={lastAccessAccount.name} css={avatarCss} size={40} />
              <div css={emailTextContainerCss}>
                <span color={Colors.NEUTRAL_70} css={subTextCss}>
                  {lastAccessAccount.loginService === LoginService.EMAIL_PASSWORD
                    ? t('authPage.continueWithEmailAndPassword')
                    : t('authPage.continueWithEmail')}
                </span>
                <Text css={emailTextCss}>
                  <span>{emailParts[0]}</span>
                  <span>@{emailParts[1]}</span>
                </Text>
              </div>
            </LastAccessChildrenWrapper>
            <RemoveButton role={'button'} onClick={forgetMethod}>
              <Icomoon type={'cancel'} color={Colors.NEUTRAL_100} size={14} />
            </RemoveButton>
          </LastAccessButton>
          {!showPasswordForm ? (
            <LastAccessButton
              icon={
                <div css={plusIconContainerCss}>
                  <Icomoon type='plus-thin' size={14} />
                </div>
              }
              color={ButtonColor.SECONDARY_DARK}
              fullWidth
              onClick={toggleOpenLastAccess}
            >
              <div>
                <Text>{t('authPage.signInWithAnotherAccount')}</Text>
              </div>
            </LastAccessButton>
          ) : (
            <Form data-lumin-form-name={FormName.SIGN_IN_FORM} onSubmit={clickSignInPassword}>
              <PasswordInput
                {...form.register('password')}
                autoFocus
                placeholder={t('placeholder.password')}
                autoComplete='current-password'
                error={getErrorMessageTranslated(errors.password?.message, t)}
                inputData={{
                  'data-lumin-name': FORM_FIELD.SIGNIN.PASSWORD.name,
                  'data-lumin-purpose': FORM_FIELD.SIGNIN.PASSWORD.purpose
                }}
              />
              <Styled.ForgotPassword>
                <Text bold underline className='underline'>
                  <Link href={forgotPasswordUrl}>{t('signInPage.forgotPassword')}</Link>
                </Text>
              </Styled.ForgotPassword>
              <Styled.SubmitButton type='submit' loading={isSubmitting} fullWidth data-lumin-btn-name={ButtonName.SIGN_IN_SUBMIT} size={ButtonSize.XL}>
                {t('common.signIn')}
              </Styled.SubmitButton>
            </Form>
          )}
        </div>
        {showPasswordForm ? (
          <>
            <div css={dividerCss} />
            <BackToSaveProfileButton as='button' variant='highlight' onClick={signInWithAnotherAccount}>
              {t('authPage.signInWithAnotherAccount')}
            </BackToSaveProfileButton>
          </>
        ) : (
          <div>
            <Divider css={textDividerCss} color={Colors.NEUTRAL_20}>
              {t('common.or')}
            </Divider>
            <SignUpFooter returnTo={returnTo} from={from} platform={platform} />
          </div>
        )}
      </div>
    </>
  );
}

export default LastAccessAccountComponent;
