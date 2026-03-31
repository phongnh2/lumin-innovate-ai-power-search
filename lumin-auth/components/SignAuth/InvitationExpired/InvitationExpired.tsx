import Image from 'next/image';

import CustomHeader from '@/components/CustomHeader/CustomHeader';
import LuminLogo from '@/components/shared/LuminLogo';
import { environment } from '@/configs/environment';
import useTranslation from '@/hooks/useTranslation';
import ExpiredLinkImg from '@/public/assets/expired-link.svg?url';
import { Button } from '@/ui';

import * as css from './InvitationExpired.styled';

function InvitationExpired() {
  const { t } = useTranslation();
  return (
    <>
      <CustomHeader noIndex />
      <div css={css.containerCss}>
        <header css={css.headerCss}>
          <LuminLogo link />
        </header>

        <div css={css.bodyCss}>
          <Image src={ExpiredLinkImg} alt='expired link' css={css.imageCss} />
          <h2 css={css.titleCss}>{t('expiredLink.title')}</h2>
          <p css={css.descriptionCss}>{t('expiredLink.subtitle')}</p>
          <Button width={200} href={environment.public.host.appUrl}>
            {t('expiredLink.backBtn')}
          </Button>
        </div>
      </div>
    </>
  );
}

export default InvitationExpired;
