// import Image from 'next/image';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { useRef, BaseSyntheticEvent } from 'react';

import { ButtonName } from '@/constants/buttonEvent';
import { QUERY_KEYS } from '@/constants/common';
import { isDesktopApp } from '@/features/desktop-app/utils';
import useSetupGoogleIdentity from '@/hooks/auth/useSetupGoogleIdentity';
import useTranslation from '@/hooks/useTranslation';
import GoogleIconSvg from '@/public/assets/logo-google.svg?url';
import { ButtonColor, ButtonSize } from '@/ui/Button';
import AppleBlackSvgIcon from '@/ui/IconButton/images/logo-apple-black.svg?url';
import DropboxSvgIcon from '@/ui/IconButton/images/logo-dropbox.svg?url';
import MicrosoftSvgIcon from '@/ui/IconButton/images/logo-microsoft.svg?url';
import SSOSvgIcon from '@/ui/IconButton/images/logo-sso.svg?url';
import XeroSvgIcon from '@/ui/IconButton/images/logo-xero.svg?url';

import { StyledButton, buttonContainerCss, buttonCss, containerCss, googleIconCss } from './SocialAuthGroup.styled';

type TProps = {
  onDropboxClick?: (e: BaseSyntheticEvent) => void;
  onAppleClick?: (e: BaseSyntheticEvent) => void;
  handleGoogleSignInResponse: ({ credential }: { credential: string }) => void;
  isSignUp: boolean;
  fromOAuth2?: boolean;
  onGoogleClick?: (e: BaseSyntheticEvent) => void;
  onMicrosoftClick?: (e: BaseSyntheticEvent) => void;
  onXeroClick?: (e: BaseSyntheticEvent) => void;
};

function SocialAuthGroup({
  onDropboxClick,
  onAppleClick,
  handleGoogleSignInResponse,
  isSignUp,
  fromOAuth2 = false,
  onGoogleClick,
  onMicrosoftClick,
  onXeroClick
}: TProps) {
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const router = useRouter();

  const { isGsiButtonReady } = useSetupGoogleIdentity({
    googleContainerRef,
    handleGoogleSignInResponse
  });

  const btnText = (method: string) => `${isSignUp ? t('authPage.signUpWith') : t('authPage.signInWith')} ${method}`;

  const onSSOClick = () => {
    const { return_to: returnToQueryValue } = router.query;
    const returnToQuery = returnToQueryValue ? `?${QUERY_KEYS.RETURN_TO}=${encodeURIComponent(String(returnToQueryValue))}` : '';
    router.push(`/sign-in-sso${returnToQuery}`);
  };

  return (
    <div css={containerCss}>
      {isGsiButtonReady ? (
        <div ref={googleContainerRef} css={buttonContainerCss}>
          <div id='googleBtn' css={buttonCss} data-lumin-btn-name={isSignUp ? ButtonName.SIGN_UP_GOOGLE : ButtonName.SIGN_IN_GOOGLE} />
        </div>
      ) : (
        <StyledButton
          color={ButtonColor.SECONDARY_DARK}
          onClick={onGoogleClick}
          icon={<Image css={googleIconCss} src={GoogleIconSvg} alt='Google' width={24} />}
          size={ButtonSize.MD}
        >
          {btnText('Google')}
        </StyledButton>
      )}
      {fromOAuth2 && (
        <StyledButton
          color={ButtonColor.SECONDARY_DARK}
          onClick={onAppleClick}
          icon={<Image css={googleIconCss} src={AppleBlackSvgIcon} alt='Apple' width={26} />}
          size={ButtonSize.MD}
        >
          {btnText('Apple')}
        </StyledButton>
      )}
      <StyledButton
        data-lumin-btn-name={isSignUp ? ButtonName.SIGN_UP_MICROSOFT : ButtonName.SIGN_IN_MICROSOFT}
        color={ButtonColor.SECONDARY_DARK}
        icon={<Image css={googleIconCss} src={MicrosoftSvgIcon} alt='Microsoft' width={24} />}
        size={ButtonSize.MD}
        onClick={onMicrosoftClick}
      >
        {btnText('Microsoft')}
      </StyledButton>

      {!isDesktopApp() && (
        <>
          <StyledButton
            data-lumin-btn-name={isSignUp ? ButtonName.SIGN_UP_DROPBOX : ButtonName.SIGN_IN_DROPBOX}
            color={ButtonColor.SECONDARY_DARK}
            onClick={onDropboxClick}
            icon={<Image css={googleIconCss} src={DropboxSvgIcon} alt='Dropbox' width={24} />}
            size={ButtonSize.MD}
          >
            {btnText('Dropbox')}
          </StyledButton>
          <StyledButton
            data-lumin-btn-name={isSignUp ? ButtonName.SIGN_UP_SSO : ButtonName.SIGN_IN_SSO}
            color={ButtonColor.SECONDARY_DARK}
            onClick={onSSOClick}
            icon={<Image css={googleIconCss} src={SSOSvgIcon} alt='SSO' width={24} />}
            size={ButtonSize.MD}
          >
            {btnText('SSO')}
          </StyledButton>
        </>
      )}
      <StyledButton
        data-lumin-btn-name={isSignUp ? ButtonName.SIGN_UP_XERO : ButtonName.SIGN_IN_XERO}
        color={ButtonColor.SECONDARY_DARK}
        onClick={onXeroClick}
        icon={<Image css={googleIconCss} src={XeroSvgIcon} alt='Xero' width={24} />}
        size={ButtonSize.MD}
      >
        {btnText('Xero')}
      </StyledButton>
    </div>
  );
}

export default SocialAuthGroup;
