import React from 'react';
import Helmet from 'react-helmet';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { useGetCurrentTeam, useGetFolderType, useGetMetaTitle, useTranslation } from 'hooks';

import { folderType } from 'constants/documentConstants';

const OrganizationPageTitle = () => {
  const { t } = useTranslation();
  const currentFolderType = useGetFolderType();
  const { data: { name } = {} } = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const { name: teamName } = useGetCurrentTeam();
  const { getMetaTitle } = useGetMetaTitle();

  const getPageTitle = () => ({
    [folderType.INDIVIDUAL]: t('pageTitle.personalDocuments'),
    [folderType.ORGANIZATION]: '',
    [folderType.SHARED]: t('pageTitle.sharedDocuments'),
    [folderType.STARRED]: t('pageTitle.starredDocuments'),
    [folderType.TEAMS]: teamName,
  }[currentFolderType]);

  return (
    <Helmet>
      <title>
        {t('common.documents')} | {name} {getMetaTitle(getPageTitle() ? `| ${getPageTitle()}` : '')}
      </title>
    </Helmet>
  );
};

OrganizationPageTitle.propTypes = {
};

OrganizationPageTitle.defaultProps = {
};

export default OrganizationPageTitle;
