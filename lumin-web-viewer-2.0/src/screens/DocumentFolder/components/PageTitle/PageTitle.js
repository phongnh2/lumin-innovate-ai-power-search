import PropTypes from 'prop-types';
import React from 'react';
import Helmet from 'react-helmet';
import { shallowEqual, useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import { useGetCurrentTeam, useGetFolderType, useGetMetaTitle, useTranslation } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { ROUTE_MATCH } from 'constants/Routers';

const PageTitle = ({ folderName }) => {
  const { t } = useTranslation();
  const currentFolderType = useGetFolderType();
  const { data: currentOrganization, loading } = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const isInOrgPage = Boolean(useMatch(ROUTE_MATCH.ORGANIZATION));
  const { name: teamName } = useGetCurrentTeam();
  const { getMetaTitle } = useGetMetaTitle();

  const getPageTitle = () => ({
    [folderType.INDIVIDUAL]: `${
      isInOrgPage ? t('pageTitle.personalDocuments') : t('pageTitle.myDocuments')
    } | ${folderName}`,
    [folderType.ORGANIZATION]: folderName,
    [folderType.TEAMS]: `${teamName} | ${folderName}`,
  }[currentFolderType]);

  if (loading) {
    return null;
  }

  return (
    <Helmet>
      <title>
        {t('common.documents')} | {currentOrganization.name} {getMetaTitle(getPageTitle() ? `| ${getPageTitle()}` : '')}
      </title>
    </Helmet>
  );
};

PageTitle.propTypes = {
  folderName: PropTypes.string,
};

PageTitle.defaultProps = {
  folderName: '',
};

export default PageTitle;
