import { useMatch, useParams } from 'react-router';

import { Routers } from 'constants/Routers';

import useGetCurrentOrganization from './useGetCurrentOrganization';
import useHomeMatch from './useHomeMatch';
import { useTranslation } from './useTranslation';

type TPayload = {
  getMetaTitle: (title: string, separator: string, suffix: string) => string;
};

const useGetMetaTitle = (): TPayload => {
  const { t } = useTranslation();
  const { type: tab } = useParams();
  const currentOrg = useGetCurrentOrganization();
  const { isHomePage } = useHomeMatch();
  const isSettingsPage = Boolean(useMatch({ path: Routers.SETTINGS.ROOT, end: false }));

  const getMetaTitle = (title: string, separator: string, suffix: string): string => {
    const defaultSeparator = separator || '| ';
    const defaultSuffix = suffix || t('pageTitle.luminPDFEditor');

    if (isSettingsPage) {
      const commonTab = t(`common.${tab}`);
      const pageTitleSettings = t('pageTitle.settings');
      return `${commonTab} ${defaultSeparator}${pageTitleSettings} ${defaultSeparator}${defaultSuffix}`;
    }

    if (isHomePage) {
      return `${t('common.home')} | ${currentOrg?.name || title} | ${defaultSuffix}`;
    }

    return title.concat(` ${defaultSeparator + defaultSuffix} `);
  };

  return { getMetaTitle };
};

export default useGetMetaTitle;
