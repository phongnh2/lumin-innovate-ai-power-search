import React from 'react';
import Helmet from 'react-helmet';
import { shallowEqual, useSelector } from 'react-redux';
import { useParams, useMatch } from 'react-router';

import selectors from 'selectors';

import { useGetCurrentTeam, useGetMetaTitle, useTranslation } from 'hooks';

import { ORG_PATH } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import { TEMPLATE_TABS } from 'constants/templateConstant';

const withTemplateTitle = (WrappedComponent) => (props) => {
  const { name: orgName } = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const { name: teamName } = useGetCurrentTeam([ROUTE_MATCH.ORGANIZATION_TEAM_TEMPLATES]) || {};
  const { type } = useParams();
  const isOrgPage = Boolean(useMatch(ORG_PATH));
  const isPersonalTab = type === TEMPLATE_TABS.PERSONAL;
  const { t } = useTranslation();
  const { getMetaTitle } = useGetMetaTitle();

  const getTabText = () => {
    if (isPersonalTab) {
      return getMetaTitle(
        isOrgPage
          ? `${t('common.templates')} | ${orgName} | ${t('pageTitle.personalTemplates')}`
          : `${t('common.templates')} | ${t('pageTitle.myTemplates')}`
      );
    }

    if (teamName) {
      return getMetaTitle(`${t('common.templates')} | ${orgName} | ${teamName}`);
    }

    return getMetaTitle(`${t('common.templates')} | ${orgName}`);
  };

  return (
    <>
      <Helmet>
        <title>{getTabText()}</title>
      </Helmet>
      <WrappedComponent {...props} />
    </>
  );
};

export default withTemplateTitle;
