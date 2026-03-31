import useTranslation from '@/hooks/useTranslation';
import LogoLumin from '@/public/assets/lumin-rounded.svg';
import LogoSign from '@/public/assets/lumin-sign-rounded.svg';
import { Text } from '@/ui';

import { footerCenterCss, footerCss, footerDescriptionCss, luminLogoCss } from './Footer.styled';

type FooterProps = {
  className?: string;
  center?: boolean;
};

function Footer({ className, center = false }: FooterProps) {
  const { t } = useTranslation();
  return (
    <footer className={className} css={[footerCss, center && footerCenterCss]}>
      <Text variant='neutral' css={footerDescriptionCss}>
        {t('authPage.footerDescription')}
      </Text>
      <div css={luminLogoCss}>
        <LogoLumin height={32} display='block' />
      </div>
      <LogoSign height={32} display='block' />
    </footer>
  );
}

export default Footer;
