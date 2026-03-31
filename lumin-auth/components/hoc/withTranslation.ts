import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const withTranslation = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'terms']))
    }
  };
};
