import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Identity } from '@/interfaces/ory';
import { Text } from '@/ui';
import { ButtonColor, ButtonSize } from '@/ui/Button';
import { Button } from '@/ui/Button/Button.styled';
import { textSizeMap } from '@/ui/Text/utils';
import { SocialSignInProviderLogo } from '@/utils/account.utils';

import { SocialSignInProvider, SocialSignInStatus } from './constant';
import { useEnableSocialSignIn, useSocialSignInEnabledSocket } from './hooks';
import { LinkCompletedModal } from './LinkCompletedModal';

import { wrapperCss, highlightAnimationCss, containerBgCss, providerWrapperCss } from './SocialSignIn.styled';

type SocialSignInProps = {
  identity: Identity;
  provider: SocialSignInProvider;
  highlight?: boolean;
  onError?: (error: unknown) => void;
};

function SocialSignIn({ identity, provider, highlight, onError }: SocialSignInProps) {
  const { t } = useTranslation();
  const { traits } = identity as Identity;
  const { status, promptEnableSocialSignIn, error } = useEnableSocialSignIn({ email: traits.email, provider });
  const [linkCompletedModalOpen, setLinkCompletedModalOpen] = useState<boolean>(false);

  useSocialSignInEnabledSocket(status);

  useEffect(() => {
    if ([SocialSignInStatus.WRONG_ACCOUNT_SELECTED, SocialSignInStatus.SUCCESS].includes(status)) {
      setLinkCompletedModalOpen(true);
    }
    if (status === SocialSignInStatus.CANCELLED) {
      setLinkCompletedModalOpen(false);
    }

    if (status === SocialSignInStatus.FAILED && onError) {
      onError(error);
    }
  }, [status]);

  const ProviderLogo = SocialSignInProviderLogo[provider];

  return (
    <>
      <section>
        <div css={containerBgCss}>
          <div css={highlight && highlightAnimationCss} />
          <div css={wrapperCss}>
            <div css={providerWrapperCss}>
              <ProviderLogo />
              <Text bold css={textSizeMap.getCss(4)}>
                {provider}
              </Text>
            </div>
            <Button color={ButtonColor.TERTIARY} size={ButtonSize.XS} onClick={promptEnableSocialSignIn} tabIndex={2}>
              {t('common.enable')}
            </Button>
          </div>
        </div>
      </section>
      <LinkCompletedModal
        provider={provider}
        isOpen={linkCompletedModalOpen}
        success={status === SocialSignInStatus.SUCCESS}
        traits={traits}
        onClose={() => setLinkCompletedModalOpen(false)}
      />
    </>
  );
}

export default SocialSignIn;
