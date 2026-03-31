import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { environment } from '@/configs/environment';
import { LocalStorageKey } from '@/constants/localStorageKey';
import { LoggerReason } from '@/constants/logger';
import { updateModalProperties } from '@/features/modal-slice';
import useForceLogout from '@/hooks/auth/useForceLogout';
import { Traits } from '@/interfaces/ory';
import { ForceLogoutType, LoginService } from '@/interfaces/user';
import { clientLogger } from '@/lib/logger';
import { ConfirmationDialog, Text } from '@/ui';
import { getFullPathWithLanguageFromUrl } from '@/utils/getLanguage';

import { LOGIN_SERVICE_TO_SOCIAL_SIGN_IN_PROVIDER, SocialSignInProvider } from './constant';

import { boldCss, messageCss } from './SocialSignIn.styled';

type LinkCompletedModalProps = {
  provider: SocialSignInProvider;
  isOpen: boolean;
  success: boolean;
  traits: Traits;
  onClose: () => void;
};

const getFailureModalData = (provider: SocialSignInProvider, email: string, onClose: () => void) => {
  if (provider === SocialSignInProvider.XERO) {
    return {
      title: <Trans i18nKey='enableXeroSignInFailed.title' />,
      onConfirm: onClose,
      message: (
        <p css={messageCss}>
          <Trans
            i18nKey='enableXeroSignInFailed.message'
            components={{
              a: (
                <Text
                  as={Link}
                  bold
                  variant='highlight'
                  href='https://login.xero.com/identity/user/login'
                  target='_blank'
                  rel='noopener noreferrer'
                  underline
                />
              ),
              b: <b css={boldCss} />
            }}
            values={{ email }}
          />
        </p>
      )
    };
  }

  return {
    title: <Trans i18nKey='enableSocialSignInFailed.title' values={{ provider }} />,
    onConfirm: onClose,
    message: (
      <span css={messageCss}>
        <Trans i18nKey='enableSocialSignInFailed.message' components={{ b: <b css={boldCss} /> }} values={{ email, provider }} />
      </span>
    )
  };
};

export const LinkCompletedModal = ({ provider, isOpen, success, traits, onClose }: LinkCompletedModalProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [logout] = useForceLogout();
  const router = useRouter();
  const { return_to: returnTo } = router.query;
  const { email, loginService } = traits;

  // Log when the forceLogInAgain modal is shown
  useEffect(() => {
    if (isOpen && success) {
      clientLogger.info({
        message: '[LinkCompletedModal] Showing forceLogInAgain modal',
        reason: LoggerReason.LINK_ACCOUNT,
        attributes: { provider, loginService }
      });
    }
  }, [isOpen, success, provider, loginService]);

  const getProviderText = () => {
    switch (loginService) {
      case LoginService.GOOGLE:
      case LoginService.MICROSOFT:
      case LoginService.XERO:
        return LOGIN_SERVICE_TO_SOCIAL_SIGN_IN_PROVIDER[loginService];
      default:
        return '';
    }
  };

  const modalData = success
    ? {
        title: t('forceLogInAgain.title'),
        onConfirm: async () => {
          // Clear the flag when user clicks "Log In Again" - they're about to be redirected anyway
          localStorage.removeItem(LocalStorageKey.LOGIN_METHOD_CHANGE_PENDING);
          dispatch(updateModalProperties({ isProcessing: true }));
          const returnToUrl = (returnTo as string) || encodeURIComponent(environment.public.host.appUrl + getFullPathWithLanguageFromUrl());
          await logout(ForceLogoutType.CHANGE_LOGIN_SERVICE, returnToUrl);
        },
        message: (
          <span css={messageCss}>
            <Trans i18nKey='forceLogInAgain.message' components={{ b: <b css={boldCss} />, br: <br /> }} values={{ email, provider: getProviderText() }} />
          </span>
        ),
        confirmText: t('forceLogInAgain.logInAgain')
      }
    : getFailureModalData(provider, email, onClose);

  return <ConfirmationDialog open={isOpen} {...modalData} />;
};
