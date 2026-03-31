import { Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useMatch } from 'react-router';

import BannerContext from 'src/navigation/Router/BannerContext';

import selectors from 'selectors';

import { BannerPersonal } from 'lumin-components/Banner';
import * as LeftSidebarStyled from 'lumin-components/LeftSidebar/LeftSidebar.styled';
import LeftSidebarItem from 'lumin-components/LeftSidebarItem';

import { useAvailablePersonalWorkspace, useTranslation } from 'hooks';

import { getAgreementGenUrl } from 'utils/agreementGen';
import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { useEnableAITool } from 'features/AgreementGen/hooks';

import { AWS_EVENTS } from 'constants/awsEvents';
import { folderType, COLLAPSE_LIST } from 'constants/documentConstants';
import { DocumentFolderTypeTab } from 'constants/documentFolderTypeTab';
import { Routers, ROUTE_MATCH } from 'constants/Routers';

import SidebarMenuLoading from '../SidebarMenuLoading';

const getPersonalDocumentPages = ({ t }) => ({
  [folderType.INDIVIDUAL]: {
    tab: folderType.INDIVIDUAL,
    iconName: 'my-document',
    text: t('sidebar.myDocuments'),
    link: DocumentFolderTypeTab.PERSONAL,
  },
  // [folderType.DEVICE]: {
  //   iconName: 'my-document',
  //   text: 'On My Device',
  //   link: DocumentFolderTypeTab.DEVICE,
  // },
  [folderType.SHARED]: {
    tab: folderType.SHARED,
    iconName: 'shared-document',
    text: t('sidebar.sharedWithMe'),
    link: DocumentFolderTypeTab.SHARED,
  },
  [folderType.STARRED]: {
    tab: folderType.STARRED,
    iconName: 'starred-document',
    text: t('sidebar.starred'),
    link: DocumentFolderTypeTab.STARRED,
  },
});

const mappedBtnNameByTab = {
  [folderType.INDIVIDUAL]: NavigationNames.MY_DOCUMENTS,
  [folderType.SHARED]: NavigationNames.SHARED_WITH_ME,
  [folderType.STARRED]: NavigationNames.STARRED,
};

function SidebarPersonalMenu() {
  const { t } = useTranslation();
  const isAvailable = useAvailablePersonalWorkspace();
  const { showBannerPersonal } = useContext(BannerContext);
  const isOffline = useSelector(selectors.isOffline);
  const documentRouteMatch = Boolean(useMatch({ path: Routers.DOCUMENTS, end: false }));
  const templateRouteMatch = Boolean(useMatch(ROUTE_MATCH.PERSONAL_TEMPLATES));
  const initialCollapse =
    (documentRouteMatch && COLLAPSE_LIST.DOCUMENT) || (templateRouteMatch && COLLAPSE_LIST.TEMPLATE);
  const dashboardRouteMatch = Boolean(useMatch('/dashboard'));
  const [activeList, setActiveList] = useState(initialCollapse);

  const agreementGenPath = getAgreementGenUrl('navigation-generate');
  const { enabled: enabledAITool } = useEnableAITool();

  const renderDocumentMenu = () =>
    Object.values(getPersonalDocumentPages({ t })).map(({ iconName, tab, text, link }, index) => {
      const isLastItem = link === folderType.STARRED;
      return (
        <LeftSidebarItem
          isSubItem
          key={index}
          iconName={iconName}
          text={text}
          link={`${Routers.DOCUMENTS}/${link}`}
          isLastItem={isLastItem}
          isDocumentUrl
          dataLuminBtnName={mappedBtnNameByTab[tab]}
          dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
        />
      );
    });

  // const renderTemplateMenu = () => <LeftSidebarItem
  //   isSubItem
  //   text={t('sidebar.myTemplates')}
  //   link={Routers.PERSONAL_TEMPLATES}
  //   isLastItem
  // />;

  const setActiveCollapseList = (newCollapseList) => () => {
    if (activeList === newCollapseList) {
      setActiveList('');
      return;
    }

    setActiveList(newCollapseList);
  };

  if (!isOffline && !isAvailable) {
    return <SidebarMenuLoading />;
  }

  return (
    <>
      <div>
        {enabledAITool && (
          <LeftSidebarItem
            link={agreementGenPath}
            iconName="lm-agreement-gen"
            text={t('common.generate')}
            dataLuminBtnName={NavigationNames.AGREEMENT_GEN}
            dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
            openInNewTab
            customIcon={<Icomoon type="lm-agreement-gen" size="md" color="inherit" />}
          />
        )}
        <LeftSidebarStyled.List>
          <LeftSidebarItem
            iconName="documents"
            text={t('common.documents')}
            link=""
            isCollapseList
            isDocumentCollapseList
            renderItems={renderDocumentMenu}
            active={documentRouteMatch}
            isOpen={activeList === COLLAPSE_LIST.DOCUMENT}
            onCollapseListClick={setActiveCollapseList(COLLAPSE_LIST.DOCUMENT)}
          />
          {/* FIXME */}
          {/* <LeftSidebarItem
            iconName="org-document"
            text={t('common.templates')}
            link=""
            isCollapseList
            renderItems={renderTemplateMenu}
            active={templateRouteMatch}
            isOpen={activeList === COLLAPSE_LIST.TEMPLATE}
            onCollapseListClick={setActiveCollapseList(COLLAPSE_LIST.TEMPLATE)}
          /> */}
        </LeftSidebarStyled.List>
        <LeftSidebarStyled.List>
          <LeftSidebarStyled.BottomGroup>
            <LeftSidebarItem
              link="/dashboard"
              iconName="insights"
              text={t('common.insights')}
              active={dashboardRouteMatch}
              dataLuminBtnName={NavigationNames.SETTINGS}
              dataLuminBtnEventType={AWS_EVENTS.NAVIGATION}
            />
          </LeftSidebarStyled.BottomGroup>
        </LeftSidebarStyled.List>
      </div>
      {showBannerPersonal && !isOffline && <BannerPersonal />}
    </>
  );
}

export default SidebarPersonalMenu;
