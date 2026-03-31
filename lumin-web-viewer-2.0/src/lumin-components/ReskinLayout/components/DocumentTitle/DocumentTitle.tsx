import classNames from 'classnames';
import { Chip, Icomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

import { useGetCurrentOrganization, useGetCurrentTeam, useNetworkStatus, useTranslation } from 'hooks';

import { organizationServices, teamServices } from 'services';

import { matchPaths } from 'helpers/matchPaths';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { ORG_TEXT } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import { TEAM_DOCUMENT_PATHS, TEAMS_TEXT } from 'constants/teamConstant';

import { IFolder } from 'interfaces/folder/folder.interface';
import { ITeam } from 'interfaces/team/team.interface';

import { BreadcrumbTitle } from './components';

import styles from './DocumentTitle.module.scss';

interface DocumentTitleProps {
  folder?: IFolder;
}

const DocumentTitle = ({ folder }: DocumentTitleProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const currentTeam = useGetCurrentTeam() as ITeam;
  const currentOrganization = useGetCurrentOrganization();
  const { isOffline } = useNetworkStatus();
  const { isVisible } = useChatbotStore();

  const isRouteMatch = Boolean(
    matchPaths(
      [
        ROUTE_MATCH.TEAM_DOCUMENT,
        ROUTE_MATCH.ORGANIZATION_DOCUMENTS.replace(':route', ORG_TEXT),
        ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.ORGANIZATION,
        ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.TEAM,
      ],
      location.pathname
    )
  );

  const matchTeamDocumentPath = matchPaths(
    TEAM_DOCUMENT_PATHS.map((route) => ({ path: route, end: false })),
    location.pathname
  );

  const settingData = useMemo(() => {
    if (!currentOrganization) {
      return {};
    }
    const { url } = currentOrganization;
    const foundTeam = currentOrganization.teams?.find((team) => team._id === currentTeam?._id);
    if (currentTeam && foundTeam) {
      const isTeamAdmin = teamServices.isOrgTeamAdmin(foundTeam.roleOfUser?.toUpperCase());
      return {
        isShowSettingIcon: isTeamAdmin,
        settingUrl: `/${ORG_TEXT}/${url}/${TEAMS_TEXT}/${foundTeam._id}/settings`,
        visibilityUrl: `/${ORG_TEXT}/${url}/${TEAMS_TEXT}/${foundTeam._id}/members`,
      };
    }
    const isOrgManager = organizationServices.isManager(currentOrganization.userRole);
    return {
      isShowSettingIcon: isOrgManager,
      settingUrl: `/${ORG_TEXT}/${url}/dashboard/settings`,
      visibilityUrl: `/${ORG_TEXT}/${url}/members`,
    };
  }, [currentOrganization, currentTeam]);

  const placeText = matchTeamDocumentPath ? t('team', { ns: 'terms' }) : t('organization', { ns: 'terms' });

  return (
    <div className={classNames(styles.container, { [styles.chatbotOpened]: isVisible })}>
      <div className={styles.leftSection}>
        <BreadcrumbTitle folder={folder} />
        {isRouteMatch && !folder && settingData?.isShowSettingIcon && (
          <PlainTooltip
            content={t('documentPage.reskin.tooltipOrgSettings', {
              place: placeText,
            })}
            disabled={isOffline}
          >
            <Chip
              size="md"
              colorType="white"
              leftIcon={<Icomoon type="settings-md" size="md" />}
              enablePointerEvents={!isOffline}
              component={Link}
              to={settingData?.settingUrl}
              disabled={isOffline}
            />
          </PlainTooltip>
        )}
      </div>
    </div>
  );
};

export default DocumentTitle;
