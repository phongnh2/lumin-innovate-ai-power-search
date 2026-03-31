import React, { useContext, useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import selectors from 'selectors';

import TemplateContext from 'screens/Templates/context';

import { useCurrentTemplateList, useTranslation } from 'hooks';

import { ORG_TEXT } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';
import { TEMPLATE_TABS } from 'constants/templateConstant';

import * as Styled from './TemplateTab.styled';

const TemplateTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { _id: orgId, name: orgName, url } = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const teams = useSelector(selectors.getTeams, shallowEqual);
  const [templateType, clientId] = useCurrentTemplateList();
  const classes = Styled.useStyles();
  const { setSearchText } = useContext(TemplateContext);
  const hasTeams = teams.length > 0;
  const templateLink = `/${ORG_TEXT}/${url}/templates/`;

  const TABS = [
    {
      value: TEMPLATE_TABS.ALL,
      label: t('common.all'),
    },
    {
      value: TEMPLATE_TABS.PERSONAL,
      label: t('templatePage.myTemplates'),
    },
  ];

  const getValue = () => (templateType === TEMPLATE_TABS.TEAM ? clientId : templateType);

  const handleChange = (value) => {
    setSearchText('');
    navigate(`${templateLink}${value}`);
  };

  const handleChildClick = (id) => {
    setSearchText('');
    navigate(`${templateLink}${TEMPLATE_TABS.TEAM}/${id}`);
  };

  const getTextTemplate = (text) => t('templatePage.textTemplates', { text });

  const tabList = useMemo(() => {
    const tabs = [...TABS];

    if (orgId) {
      tabs.push({
        value: TEMPLATE_TABS.ORGANIZATION,
        label: getTextTemplate(orgName),
        tooltip: getTextTemplate(orgName),
      });
    }

    if (hasTeams) {
      const tabPopperItems = teams.map((item) => ({
        value: item._id,
        label: getTextTemplate(item.name),
        tooltip: getTextTemplate(item.name),
        onClick: () => handleChildClick(item._id),
      }));

      tabs.push({
        value: TEMPLATE_TABS.TEAM,
        label: getTextTemplate(t('common.team')),
        popperItems: tabPopperItems,
      });
    }

    return tabs;
  }, [orgId, teams]);

  return (
    <Styled.Container>
      <Styled.Wrapper>
        <Styled.Tabs
          tabs={tabList}
          value={getValue()}
          onChange={handleChange}
          classes={{ tab: classes.tab }}
          activeBarColor={Colors.SECONDARY_50}
        />
      </Styled.Wrapper>
    </Styled.Container>
  );
};

export default TemplateTab;
