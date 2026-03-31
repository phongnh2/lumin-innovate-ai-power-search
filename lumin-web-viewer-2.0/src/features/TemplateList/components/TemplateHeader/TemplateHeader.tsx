import { PlainTooltip, Chip, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { MemberGroupAvatar } from 'luminComponents/ReskinLayout/components/DocumentTitle/components';

import { useGetCurrentOrganization, useGetCurrentTeam, useGetFolderType, useNetworkStatus } from 'hooks';
import useTemplatesPageMatch from 'hooks/useTemplatesPageMatch';

import { organizationServices, teamServices } from 'services';

import { matchPaths } from 'helpers/matchPaths';

import { UploadTemplateButton } from 'features/UploadTemplate';

import { folderType } from 'constants/documentConstants';
import { TOOLTIP_MAX_WIDTH, TOOLTIP_OPEN_DELAY } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import { TEAMS_TEXT } from 'constants/teamConstant';

import { ITeam } from 'interfaces/team/team.interface';

import styles from './TemplateHeader.module.scss';

const TemplateHeader = () => {
  const { t } = useTranslation();
  const currentFolderType = useGetFolderType();
  const currentTeam = useGetCurrentTeam() as ITeam;
  const currentOrganization = useGetCurrentOrganization();
  const { isPersonalTemplatePage } = useTemplatesPageMatch();
  const { isOffline } = useNetworkStatus();

  const titleMapping = {
    [folderType.INDIVIDUAL]: t('pageTitle.myTemplates'),
    [folderType.ORGANIZATION]: `All ${currentOrganization?.name || ''}`,
    [folderType.TEAMS]: currentTeam?.name || '',
  };
  const title = titleMapping[currentFolderType];

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
  const matchTeamDocumentPath = matchPaths([ROUTE_MATCH.ORGANIZATION_TEAM_TEMPLATES], location.pathname);
  const placeText = matchTeamDocumentPath ? t('team', { ns: 'terms' }) : t('organization', { ns: 'terms' });

  return (
    <div data-dropzone-padding={16} className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.leftSection}>
          <PlainTooltip
            content={title}
            maw={TOOLTIP_MAX_WIDTH}
            openDelay={TOOLTIP_OPEN_DELAY}
            position="top"
            key={title}
            disabled={isOffline}
          >
            <div className={styles.itemWrapper}>
              <span className={styles.item}>{title}</span>
            </div>
          </PlainTooltip>
          {!isPersonalTemplatePage && settingData?.isShowSettingIcon && (
            <PlainTooltip
              content={t('documentPage.reskin.tooltipOrgSettings', {
                place: placeText,
              })}
            >
              <Chip
                size="md"
                colorType="white"
                leftIcon={<Icomoon type="settings-md" size="md" />}
                enablePointerEvents={!isOffline}
                disabled={isOffline}
                component={Link}
                to={settingData?.settingUrl}
              />
            </PlainTooltip>
          )}
        </div>
        <UploadTemplateButton />
      </div>
      {!isPersonalTemplatePage && <MemberGroupAvatar />}
    </div>
  );
};

export default TemplateHeader;
