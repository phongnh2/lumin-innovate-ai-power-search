import dynamic from 'next/dynamic';
import { Children, cloneElement, isValidElement, ReactNode } from 'react';

import useTranslation from '@/hooks/useTranslation';
import { Text } from '@/ui';

import { mainLayout, verifyLayout, titleCss, subTextCss, titleWithSubTitleCss } from './LayoutSignAuth.styled';

const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });
interface ILayoutSignAuthProps {
  i18nKeyTitle?: string;
  i18nSubTitle?: string;
  children: ReactNode;
  isVerifyPage?: boolean;
}
const LayoutSignAuth = ({ i18nKeyTitle, i18nSubTitle, children, isVerifyPage, ...otherProps }: ILayoutSignAuthProps) => {
  const { t } = useTranslation();
  const css = isVerifyPage ? verifyLayout : mainLayout;

  return (
    <>
      <main css={css}>
        {i18nKeyTitle && (
          <Text as={'h1'} bold css={i18nSubTitle ? titleWithSubTitleCss : titleCss}>
            {t(i18nKeyTitle)}
          </Text>
        )}
        {i18nSubTitle && (
          <Text css={subTextCss} variant='neutral'>
            {t(i18nSubTitle)}
          </Text>
        )}

        {Children.map(children, child => {
          if (isValidElement(child)) {
            return cloneElement(child, otherProps);
          }
          return child;
        })}
      </main>
      <Footer center />
    </>
  );
};

export default LayoutSignAuth;
