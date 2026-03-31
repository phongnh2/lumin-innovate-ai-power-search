import { capitalize } from 'lodash';
import React, { useContext, useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useParams, matchPath, useMatch } from 'react-router';

import selectors from 'selectors';

import TemplateContext from 'screens/Templates/context';

import Icomoon from 'lumin-components/Icomoon';
import PageTitlePortal from 'lumin-components/PortalElement/PageTitlePortal';
import SearchDocument from 'lumin-components/SearchDocument';
import Tooltip from 'lumin-components/Shared/Tooltip';
import UploadTemplatesButton from 'lumin-components/UploadTemplatesButton';

import { useDesktopMatch, useTabletMatch, useCurrentTemplateList, useTranslation } from 'hooks';

import { ORGANIZATION_TEXT, ORG_PATH } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';
import { TEMPLATE_TABS } from 'constants/templateConstant';

import * as Styled from './TemplatesHeader.styled';

function TemplatesHeader() {
  const { t } = useTranslation();
  const isDesktopUp = useDesktopMatch();
  const isTabletUp = useTabletMatch();
  const { type, teamId } = useParams();
  const { name: orgName } = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const { path } = useMatch();
  const isInOrgPage = Boolean(matchPath(path, { path: ORG_PATH }));
  const [templateType] = useCurrentTemplateList();
  const isTabAll = templateType === TEMPLATE_TABS.ALL;

  const {
    setSearchText, focusing, setFocusing, searchText,
  } = useContext(TemplateContext);

  const templateTabText = useMemo(() => isInOrgPage ? orgName : t('templatePage.myTemplates'), [orgName]);

  const leftElement = () => (
    <Styled.Header>
      <Styled.Title>{templateTabText}</Styled.Title>
      <Tooltip title={t('templatePage.tooltipHeader', { orgText: capitalize(ORGANIZATION_TEXT) })}>
        <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
      </Tooltip>
    </Styled.Header>
  );

  const containerEl = useMemo(() => (
      <Styled.Container>
        <Styled.SearchContainer>
          {!isTabletUp && <Styled.Title>{templateTabText}</Styled.Title>}
          <SearchDocument
            onChange={setSearchText}
            animate={isTabletUp}
            leftElement={isTabletUp && leftElement()}
            setFocusing={setFocusing}
            isSearchView={focusing || Boolean(searchText)}
            placeholder={focusing ? t('templatePage.searchByTemplateName') : t('common.search')}
            resetOn={[type, teamId]}
          />
          {isTabletUp && !isTabAll && <UploadTemplatesButton />}
        </Styled.SearchContainer>
      </Styled.Container>
  ), [focusing, searchText, setFocusing, setSearchText, templateTabText, isTabletUp, templateType]);

  return isDesktopUp ? (
    <PageTitlePortal.Element>{containerEl}</PageTitlePortal.Element>
  ) : (
    containerEl
  );
}

export default TemplatesHeader;
