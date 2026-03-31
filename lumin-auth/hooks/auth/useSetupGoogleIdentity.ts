import { RefObject, useEffect } from 'react';

import { environment } from '@/configs/environment';
import { isDesktopApp } from '@/features/desktop-app/utils';
import { buttonEvent } from '@/lib/factory/button.event';
import { useAppSelector } from '@/lib/hooks';
import { isGSILoaded } from '@/selectors';

import useGoogleButtonWidth from './useGoogleButtonWidth';

type TSetupGoogleIdentityProps = {
  googleContainerRef: RefObject<HTMLDivElement>;
  handleGoogleSignInResponse: ({ credential }: { credential: string }) => void;
};

function useSetupGoogleIdentity({ googleContainerRef, handleGoogleSignInResponse }: TSetupGoogleIdentityProps) {
  const isGsiLoaded = useAppSelector(isGSILoaded);
  const { buttonWidth } = useGoogleButtonWidth({ googleContainerRef, isGsiLoaded });

  const onClickHandler = (): void => {
    const element = document.getElementById('googleBtn');
    buttonEvent.signInGoogle(element);
  };

  const isGsiButtonReady = isGsiLoaded && window.google && !isDesktopApp();

  useEffect(() => {
    if (isGsiButtonReady) {
      window.google.accounts.id.initialize({
        client_id: environment.public.google.clientId,
        ux_mode: 'popup',
        callback: handleGoogleSignInResponse
      });
      window.google.accounts.id.renderButton(document.getElementById('googleBtn') as HTMLDivElement, {
        theme: 'outline',
        size: 'large',
        logo_alignment: 'center',
        width: buttonWidth,
        type: 'standard',
        click_listener: onClickHandler
      });
    }
  }, [isGsiLoaded, buttonWidth, isGsiButtonReady]);

  return { isGsiButtonReady };
}

export default useSetupGoogleIdentity;
