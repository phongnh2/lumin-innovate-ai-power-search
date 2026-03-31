import { Icomoon, PlainTooltip, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useState, useRef } from 'react';
import { TFunction } from 'react-i18next';
import { useNavigate } from 'react-router';

import { SubMenuTypes } from 'luminComponents/ReskinLayout/components/LeftSidebarDrawer/LeftSidebarDrawer.constants';
import { SubSidebarItem } from 'luminComponents/ReskinLayout/components/SubSidebarItem';

import { useGetCurrentOrganization } from 'hooks';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';
import { folderType } from 'constants/documentConstants';
import { DocumentFolderTypeTab } from 'constants/documentFolderTypeTab';
import { TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';

type PropTypes = {
  t: TFunction;
  baseRoute: string;
  type?: SubMenuTypes;
};

const DocumentItemsContainer = (props: PropTypes) => {
  const { baseRoute, t, type = SubMenuTypes.Documents } = props;
  const navigate = useNavigate();
  const currentOrg = useGetCurrentOrganization();
  const isTemplates = type === SubMenuTypes.Templates;

  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();
  const [disabledTooltip, setDisabledTooltip] = useState(false);

  const onMouseLeave = () => {
    clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(() => {
      setDisabledTooltip(false);
    }, TOOLTIP_OPEN_DELAY);
  };

  const onMouseEnter = () => {
    clearTimeout(tooltipTimeoutRef.current);
    setDisabledTooltip(true);
  };

  const DocumentTabs = {
    [folderType.INDIVIDUAL]: {
      id: folderType.INDIVIDUAL,
      iconName: isTemplates ? 'user-md' : 'file-type-pdf-md',
      text: isTemplates ? t('sidebar.myTemplates') : t('sidebar.myDocuments') ,
      link: DocumentFolderTypeTab.PERSONAL,
      dataCy: 'myDocuments_sidebar',
      dataLuminBtnName: NavigationNames.MY_DOCUMENTS,
    },
    [folderType.ORGANIZATION]: currentOrg
      ? {
          id: folderType.ORGANIZATION,
          leftElement: <Icomoon type="main-circle-md" size="md" color="var(--kiwi-colors-surface-on-surface)" />,
          rightElement: (
            <PlainTooltip
              withinPortal={false}
              floatingStrategy="fixed"
              content={t('sidebar.viewAllTargetMembers', { target: t('organization', { ns: 'terms' }) })}
            >
              <IconButton
                size="md"
                icon="users-md"
                color="var(--kiwi-colors-surface-on-surface)"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigate(`/${ORG_TEXT}/${currentOrg.url}/members`);
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              />
            </PlainTooltip>
          ),
          text: currentOrg.name,
          link: DocumentFolderTypeTab.ORGANIZATION,
          dataCy: 'organization_sidebar',
          dataLuminBtnName: NavigationNames.WORKSPACE,
        }
      : null,
    ...(!isTemplates && {
      [folderType.SHARED]: {
        id: folderType.SHARED,
        iconName: 'share-md',
        text: t('sidebar.sharedWithMe'),
        link: DocumentFolderTypeTab.SHARED,
        dataCy: 'sharedWithMe_sidebar',
        dataLuminBtnName: NavigationNames.SHARED_WITH_ME,
      },
      [folderType.STARRED]: {
        id: folderType.STARRED,
        iconName: 'star-md',
        text: t('sidebar.starred'),
        link: DocumentFolderTypeTab.STARRED,
        dataCy: 'starred_sidebar',
        dataLuminBtnName: NavigationNames.STARRED,
      },
    }),
    // [folderType.RECENT]: {
    //   id: folderType.RECENT,
    //   iconName: 'recent-md',
    //   text: 'Recent',
    //   link: DocumentFolderTypeTab.RECENT,
    //   dataCy: 'recent_sidebar',
    //   dataLuminBtnName: NavigationNames.RECENT,
    // },
  };
  return Object.values(DocumentTabs).map(
    (tab) =>
      tab && (
        <SubSidebarItem
          key={tab.id}
          title={tab.text}
          leftElement={
            tab.leftElement || <Icomoon type={tab.iconName} size="md" color="var(--kiwi-colors-surface-on-surface)" />
          }
          disabledTooltip={tab.id === folderType.ORGANIZATION ? disabledTooltip : false}
          rightElement={tab.rightElement}
          to={`${baseRoute}/${tab.link}`}
          activeTab="documentTab"
          data-cy={tab.dataCy}
          data-lumin-btn-name={tab.dataLuminBtnName}
          data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
        />
      )
  );
};

export default DocumentItemsContainer;
