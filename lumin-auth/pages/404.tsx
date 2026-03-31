import { css } from '@emotion/react';
import Image from 'next/image';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ReactElement } from 'react';

import CustomHeader from '@/components/CustomHeader/CustomHeader';
import { Header } from '@/components/Header';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth/LayoutSignAuth';
import { Routes } from '@/configs/routers';
import useTranslation from '@/hooks/useTranslation';
import NotFoundImage from '@/public/assets/not-found.svg?url';
import { Text, Button, mediaQueryDown, mediaQueryUp } from '@/ui';
import { ButtonSize } from '@/ui/Button';
import { avoidNonOrphansWord } from '@/utils/string.utils';

const imageCss = css`
  max-width: 300px;
  height: auto;
  ${mediaQueryDown.md} {
    max-width: 200px;
  }
`;

const containerCss = css`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const descriptionCss = css`
  margin: 12px 0;
  ${mediaQueryUp.md} {
    margin: 12px 0 24px;
  }
`;

const Custom404 = () => {
  const { t } = useTranslation();
  return (
    <>
      <CustomHeader title={t('notFound.title')} description={t('notFound.description')} />
      <Header />
      <div css={containerCss}>
        <Image src={NotFoundImage} alt='Not Found' css={imageCss} />
        <Text
          as='h1'
          level={2}
          align='center'
          bold
          css={css`
            margin-top: 48px;
          `}
        >
          {t('notFound.title')}
        </Text>
        <Text align='center' css={descriptionCss}>
          {avoidNonOrphansWord(t('notFound.description'))}
        </Text>

        <Link href={Routes.Root} passHref legacyBehavior>
          <Button
            component='a'
            size={{
              mobile: ButtonSize.SM,
              tablet: ButtonSize.MD
            }}
          >
            {t('notFound.goToHomePage')}
          </Button>
        </Link>
      </div>
    </>
  );
};

Custom404.getLayout = function getLayout(page: ReactElement) {
  return <LayoutSignAuth>{page}</LayoutSignAuth>;
};

export default Custom404;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'terms']))
      // Will be passed to the page component as props
    }
  };
}
