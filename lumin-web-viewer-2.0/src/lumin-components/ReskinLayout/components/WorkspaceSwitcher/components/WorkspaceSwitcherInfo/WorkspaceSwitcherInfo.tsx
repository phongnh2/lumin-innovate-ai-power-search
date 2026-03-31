import { capitalize } from 'lodash';
import { Avatar, Text, Button, Icomoon, IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useNavigate } from 'react-router';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import OrgNameAndPlanInfo from 'luminComponents/OrgNameAndPlanInfo';

import { usePersonalWorkspaceLocation, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { avatar as avatarUtils, eventTracking } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { usePromptToUploadLogoStore } from 'features/CNC/CncComponents/PromptToUploadLogoModal/hooks/usePromptToUploadLogoStore';
import { PROMPT_TO_UPLOAD_LOGO_TYPE } from 'features/CNC/constants/customConstant';
import { CNCButtonName } from 'features/CNC/constants/events/button';
import { useGetPromptUpdateLogo } from 'features/CNC/hooks/useGetPromptUpdateLogo';

import UserEventConstants from 'constants/eventConstants';
import { TOOLTIP_OPEN_DELAY, TOOLTIP_MAX_WIDTH } from 'constants/lumin-common';
import { InviteUsersSetting } from 'constants/organization.enum';
import { ORG_TEXT } from 'constants/organizationConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { WorkspaceInfo } from '../../WorkspaceSwitcher.interface';

import styles from './WorkspaceSwitcherInfo.module.scss';

export interface WorkspaceSwitcherInfoProps {
  workspace: WorkspaceInfo;
  isOnlyJoinedOneWorkspace: boolean;
  onToggleSwitcher: () => void;
  onToggleInviteMembers: () => void;
  currentOrganization: IOrganization;
  onCloseDrawer: () => void;
}

const WorkspaceSwitcherInfo = ({
  workspace,
  isOnlyJoinedOneWorkspace,
  onToggleSwitcher,
  onToggleInviteMembers,
  currentOrganization,
  onCloseDrawer,
}: WorkspaceSwitcherInfoProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();
  const { shouldShowPromptUpdateLogo } = useGetPromptUpdateLogo({ currentOrganization });
  const { open: openPromptToUploadLogoModal, setCurrentOrgToUpdateAvatar } = usePromptToUploadLogoStore();

  if (!workspace) {
    return null;
  }

  const isManager = organizationServices.isManager(workspace.userRole);
  const isAllowMemberCanInvite = isManager || workspace.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE;

  return (
    <div className={styles.switcherInfoContainer} data-cy="workspace_switcher_info_section">
      {shouldShowPromptUpdateLogo && (
        <div className={styles.uploadLogoBtnWrapper}>
          <Text type="title" size="xs" color="var(--kiwi-colors-core-secondary)">
            {t('createOrg.stillUsingDefaultAvatar')}
          </Text>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => {
              onToggleSwitcher();
              onCloseDrawer();
              setCurrentOrgToUpdateAvatar(currentOrganization);
              openPromptToUploadLogoModal({
                promptType: PROMPT_TO_UPLOAD_LOGO_TYPE.ORGANIZATION_SETTINGS,
                onChange: () => {},
              });
            }}
            data-lumin-btn-name={CNCButtonName.OPEN_SUGGESTION_MODAL_FROM_WS_SWITCHER}
          >
            {t('common.uploadLogo')}
          </Button>
        </div>
      )}
      <Avatar
        size="lg"
        variant="outline"
        src={avatarUtils.getAvatar(workspace.avatarRemoteId) || DefaultOrgAvatar}
        name={workspace.name}
      />
      <div className={styles.workspaceInfoWrapper}>
        {isAtPersonalWorkspace ? (
          <>
            <PlainTooltip content={workspace.name} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
              <p className={styles.orgName}>{workspace.name}</p>
            </PlainTooltip>
            <Text type="body" size="sm" className={styles.workspacePlan}>
              {capitalize(workspace.plan)}
            </Text>
          </>
        ) : (
          <OrgNameAndPlanInfo
            organization={currentOrganization}
            containerProps={{ className: styles.workspaceInfoWrapper }}
            orgNameProps={{ className: styles.orgName }}
          />
        )}
      </div>
      {!isAtPersonalWorkspace && (isManager || isAllowMemberCanInvite) && (
        <div className={styles.workspaceActionWrapper}>
          {isAllowMemberCanInvite && (
            <Button
              variant="elevated"
              startIcon={<Icomoon type="users-md" size="md" />}
              onClick={() => {
                onToggleSwitcher();
                onToggleInviteMembers();
                eventTracking(UserEventConstants.EventType.WORKSPACE_SWITCHER, {
                  elementName: ButtonName.WORKSPACE_SWITCHER_INVITE_CIRCLE_MEMBER,
                }).catch(() => {});
              }}
              data-cy="invite_members_button"
            >
              {t('workspaceSwitcher.inviteMembers')}
            </Button>
          )}
          {isManager && (
            <IconButton
              variant="elevated"
              icon="settings-md"
              className={styles.workspaceSetting}
              onClick={() => {
                onToggleSwitcher();
                navigate(workspace.settingPageUrl);
                eventTracking(UserEventConstants.EventType.WORKSPACE_SWITCHER, {
                  elementName: ButtonName.WORKSPACE_SWITCHER_SETTINGS,
                }).catch(() => {});
              }}
              data-cy="workspace_setting_button"
            />
          )}
        </div>
      )}
      {isOnlyJoinedOneWorkspace && (
        <div className={styles.createWorkspaceWrapper}>
          <PlainTooltip content={t('workspaceSwitcher.createWorkspace')}>
            <IconButton
              icon="add-to-md"
              onClick={() => {
                navigate(`/${ORG_TEXT}/create`);
                eventTracking(UserEventConstants.EventType.WORKSPACE_SWITCHER, {
                  elementName: ButtonName.WORKSPACE_SWITCHER_CREATE_WORKSPACE,
                }).catch(() => {});
              }}
              data-cy="create_workspace_button"
            />
          </PlainTooltip>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcherInfo;
