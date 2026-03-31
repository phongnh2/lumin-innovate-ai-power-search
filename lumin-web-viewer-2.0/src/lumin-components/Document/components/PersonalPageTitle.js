import React from 'react';
import Helmet from 'react-helmet';

import { useGetFolderType, useGetMetaTitle, useTranslation } from 'hooks';

import { folderType } from 'constants/documentConstants';

const PersonalPageTitle = () => {
  const { t } = useTranslation();
  const { getMetaTitle } = useGetMetaTitle();

  const PAGE_TITLES = {
    [folderType.DEVICE]: t('pageTitle.myDocuments'),
    [folderType.INDIVIDUAL]: t('pageTitle.myDocuments'),
    [folderType.SHARED]: t('pageTitle.personalSharedDocuments'),
    [folderType.STARRED]: t('pageTitle.personalStarredDocuments'),
  };
  const currentFolderType = useGetFolderType();

  return (
    <Helmet>
      <title>{getMetaTitle(`${PAGE_TITLES[currentFolderType]}`)}</title>
    </Helmet>
  );
};

export default PersonalPageTitle;
