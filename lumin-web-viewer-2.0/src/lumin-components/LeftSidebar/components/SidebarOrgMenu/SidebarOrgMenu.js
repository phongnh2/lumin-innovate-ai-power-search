import { isEmpty, omit } from 'lodash';
import { Icomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useMatch } from 'react-router-dom';

import BannerContext from 'src/navigation/Router/BannerContext';

import selectors from 'selectors';

import { BannerOrganization } from 'lumin-components/Banner';
import * as LeftSidebarStyled from 'lumin-components/LeftSidebar/LeftSidebar.styled';
import LeftSidebarItem from 'lumin-components/LeftSidebarItem';
import Scrollbars from 'lumin-components/Shared/CustomScroll';

import { useDesktopMatch, useGetCurrentTeam, useTranslation } from 'hooks';
import useShowInformDocument from 'hooks/useShowInformDocument';

import { organizationServices } from 'services';

import { isSystemFileSupported } from 'helpers/pwa';

import { getAgreementGenUrl } from 'utils/agreementGen';
import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { useEnableAITool } from 'features/AgreementGen/hooks';

import { AWS_EVENTS } from 'constants/awsEvents';
import { DOMAIN_WHITE_LIST } from 'constants/customConstant';
import { folderType, COLLAPSE_LIST } from 'constants/documentConstants';
import { DocumentFolderTypeTab } from 'constants/documentFolderTypeTab';
import { ORG_TEXT } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import { TEAM_TEXT, TEAMS_TEXT } from 'constants/teamConstant';

const MigratedInformGuide = lazyWithRetry(() =>
  import(/* webpackPrefetch: true */ 'luminComponents/MigratedInformGuide')
);

const propTypes = {
  currentOrganization: PropTypes.object,
};
const defaultProps = {
  currentOrganization: {},
};

const getOrgDocumentPages = ({ organizationName, t }) => ({
  [folderType.INDIVIDUAL]: {
    id: folderType.INDIVIDUAL,
    iconName: 'my-document',
    text: t('sidebar.myDocuments'),
    link: DocumentFolderTypeTab.PERSONAL,
  },
  [folderType.DEVICE]: {
    id: folderType.DEVICE,
    iconName: 'my-document',
    text: t('sidebar.onMyDevice'),
    link: DocumentFolderTypeTab.DEVICE,
  },
  [folderType.SHARED]: {
    id: folderType.SHARED,
    iconName: 'shared-document',
    text: t('sidebar.sharedWithMe'),
    link: DocumentFolderTypeTab.SHARED,
  },
  [folderType.ORGANIZATION]: {
    id: folderType.ORGANIZATION,
    iconName: 'circle-document',
    text: organizationName,
    link: DocumentFolderTypeTab.ORGANIZATION,
  },
  [folderType.TEAMS]: {
    id: folderType.TEAMS,
    iconName: 'team-document',
    text: t('common.teams'),
    link: DocumentFolderTypeTab.TEAM,
  },
  [folderType.STARRED]: {
    id: folderType.STARRED,
    iconName: 'starred-document',
    text: t('sidebar.starred'),
    link: DocumentFolderTypeTab.STARRED,
  },
});

const mappedBtnNameByTab = {
  [folderType.INDIVIDUAL]: NavigationNames.MY_DOCUMENTS,
  [folderType.SHARED]: NavigationNames.SHARED_WITH_ME,
  [folderType.STARRED]: NavigationNames.STARRED,
  [folderType.ORGANIZATION]: NavigationNames.WORKSPACE,
};

function SidebarOrgMenu({ currentOrganization: { data: currentOrg, loading } }) {
  const { t } = useTranslation();
  const isDesktop = useDesktopMatch();
  const documentRouteMatch = Boolean(useMatch({ path: ROUTE_MATCH.ORG_DOCUMENT, end: false }));
  const templateRouteMatch = Boolean(useMatch(ROUTE_MATCH.ORGANIZATION_TEMPLATES));
  const documentTeamRouteMatch = Boolean(useMatch({ path: ROUTE_MATCH.TEAM_DOCUMENT, end: false }));
  const initialCollapse =
    (documentRouteMatch && COLLAPSE_LIST.DOCUMENT) || (templateRouteMatch && COLLAPSE_LIST.TEMPLATE);
  const orgTeams = useSelector(selectors.getTeams, shallowEqual) || [];
  const [activeList, setActiveList] = useState(initialCollapse);
  const [activeSubList, setActiveSubList] = useState(documentTeamRouteMatch ? COLLAPSE_LIST.TEAM : '');
  const currentTeam = useGetCurrentTeam([
    ROUTE_MATCH.TEAM_DOCUMENT,
    ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.TEAM,
    ROUTE_MATCH.ORGANIZATION_TEAM_TEMPLATES,
  ]);
  const { url, userRole, settings = {}, name = '', domain, _id } = currentOrg || {};
  const orgDocumentPages = useMemo(() => {
    const orgPages = getOrgDocumentPages({ organizationName: name, t });
    if (!DOMAIN_WHITE_LIST.ON_MY_DEVICE_TAB.includes(domain) || !isSystemFileSupported()) {
      delete orgPages[folderType.DEVICE];
    }

    return orgPages;
  }, [name, _id]);
  const { showBannerOrg } = useContext(BannerContext);
  const orgLink = `/${ORG_TEXT}/${url}`;
  const getPath = (page) => `${orgLink}/${page}`;
  const isOffline = useSelector(selectors.isOffline);
  const pages = getOrgPagesPath();
  const isManager = userRole && organizationServices.isManager(userRole);
  const shouldShowMemberTab = () => !settings.other?.hideMember || isManager;
  const { _id: currentTeamId } = currentTeam;
  const shouldShowMigratedInform = useShowInformDocument();

  const { enabled: enabledAITool } = useEnableAITool();

  function getOrgPagesPath() {
    return {
      documents: getPath('documents'),
      templates: getPath('templates'),
      members: getPath('members'),
      teams: getPath(TEAMS_TEXT),
      dashboard: getPath('dashboard'),
      shared: getPath('shared'),
      upgrade: getPath('plans'),
      agreementGen: getAgreementGenUrl('navigation-generate'),
    };
  }

  const renderTeamItem = (baseUrl) => () =>
    orgTeams.map((team) => (
      <LeftSidebarItem
        key={team._id}
        link={`${baseUrl}/${TEAM_TEXT}/${team._id}`}
        text={team.name}
        active={team._id === currentTeamId}
        isSubItem
        nested
        isDocumentUrl
        dataLuminBtnName={NavigationNames.SPACE}
        dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
      />
    ));

  const getDocumentPagesWillRender = () =>
    !orgTeams?.length ? omit(orgDocumentPages, folderType.TEAMS) : orgDocumentPages;

  const setActiveCollapseList = (newCollapseList) => () => {
    if (activeList === newCollapseList) {
      setActiveList('');
      return;
    }

    setActiveList(newCollapseList);
    setActiveSubList('');
  };

  const setActiveSubCollapseList = () => {
    setActiveSubList(activeSubList ? '' : COLLAPSE_LIST.TEAM);
  };

  const renderDocumentsItem = () => {
    const itemWillRender = getDocumentPagesWillRender();
    return Object.values(itemWillRender).map(({ link, id: tabId, iconName, text }) => {
      const isDocTeamMenu = link === DocumentFolderTypeTab.TEAM;
      const isLastItem = link === DocumentFolderTypeTab.STARRED;
      const arrowTooltip = isDocTeamMenu
        ? {
            open: t('sidebar.viewAllTeams'),
            close: t('sidebar.hideAllTeams'),
          }
        : undefined;
      const isTeamActived = !isEmpty(currentTeam) && tabId === folderType.TEAMS;
      const isTeamCollapseActive = isDocTeamMenu && activeSubList === COLLAPSE_LIST.TEAM;
      return (
        <LeftSidebarItem
          isCollapseList={isDocTeamMenu}
          onCollapseListClick={setActiveSubCollapseList}
          key={tabId}
          link={!isDocTeamMenu ? `${pages.documents}/${link}` : ''}
          iconName={iconName}
          text={text}
          renderItems={isDocTeamMenu ? renderTeamItem(pages.documents) : null}
          isLastItem={isLastItem}
          arrowTooltip={arrowTooltip}
          active={isTeamActived}
          isOpen={isTeamCollapseActive}
          isSubItem
          nested={isDocTeamMenu}
          isDocTeamMenu={isDocTeamMenu}
          isDocumentUrl
          className={tabId === folderType.INDIVIDUAL ? 'joyride-documents' : undefined}
          showUploadDocumentGuide={shouldShowMigratedInform && isDesktop}
          dataLuminBtnName={mappedBtnNameByTab[tabId]}
          dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
        />
      );
    });
  };

  useEffect(() => {
    if (!documentRouteMatch && !templateRouteMatch) {
      return;
    }
    setActiveList((documentRouteMatch && COLLAPSE_LIST.DOCUMENT) || (templateRouteMatch && COLLAPSE_LIST.TEMPLATE));
  }, [documentRouteMatch, templateRouteMatch]);

  useEffect(() => {
    if (!documentTeamRouteMatch) {
      return;
    }
    setActiveSubList(COLLAPSE_LIST.TEAM);
  }, [documentTeamRouteMatch]);

  return (
    <>
      <div>
        {enabledAITool && (
          <LeftSidebarItem
            link={pages.agreementGen}
            text={t('common.generate')}
            dataLuminBtnName={NavigationNames.AGREEMENT_GEN}
            dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
            openInNewTab
            customIcon={<Icomoon type="lm-agreement-gen" size="md" color="inherit" />}
          />
        )}
        <Scrollbars autoHide autoHeight autoHeightMax={284}>
          <LeftSidebarStyled.List>
            <LeftSidebarItem
              active={documentRouteMatch}
              isOpen={activeList === COLLAPSE_LIST.DOCUMENT}
              onCollapseListClick={setActiveCollapseList(COLLAPSE_LIST.DOCUMENT)}
              link=""
              iconName="documents"
              text={t('common.documents')}
              renderItems={renderDocumentsItem}
              isCollapseList
              isDocumentCollapseList
            />
          </LeftSidebarStyled.List>
        </Scrollbars>
        <LeftSidebarStyled.List style={{ marginTop: 0 }}>
          <LeftSidebarStyled.BottomGroup>
            {/* FIXME */}
            {/* <LeftSidebarItem
              link={pages.templates}
              iconName="org-document"
              text={t('common.templates')}
            /> */}
            {shouldShowMemberTab() && (
              <LeftSidebarItem
                link={pages.members}
                iconName="members"
                text={t('common.members')}
                className="joyride-members"
                dataLuminBtnName={NavigationNames.MEMBERS}
                dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
              />
            )}
            <LeftSidebarItem
              link={pages.teams}
              iconName="team"
              iconSize={20}
              text={t('common.teams')}
              className="joyride-teams"
              dataLuminBtnName={NavigationNames.SPACES}
              dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
            />
          </LeftSidebarStyled.BottomGroup>
          {isManager && (
            <LeftSidebarItem
              link={pages.dashboard}
              iconName="dashboard"
              text={t('common.dashboard')}
              className="joyride-dashboards"
              dataLuminBtnName={NavigationNames.SETTINGS}
              dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
            />
          )}
        </LeftSidebarStyled.List>
      </div>
      {!loading && showBannerOrg && !isOffline && <BannerOrganization />}
      {shouldShowMigratedInform && isDesktop && <MigratedInformGuide />}
    </>
  );
}

SidebarOrgMenu.propTypes = propTypes;
SidebarOrgMenu.defaultProps = defaultProps;

export default SidebarOrgMenu;
