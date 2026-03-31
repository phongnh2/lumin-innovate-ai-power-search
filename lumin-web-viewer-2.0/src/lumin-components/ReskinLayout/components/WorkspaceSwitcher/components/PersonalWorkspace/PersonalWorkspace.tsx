import { Avatar, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import { useTranslation } from 'hooks';

import { avatar as avatarUtils } from 'utils';

import { TOOLTIP_OPEN_DELAY, TOOLTIP_MAX_WIDTH } from 'constants/lumin-common';

import { WorkspaceInfo } from '../../WorkspaceSwitcher.interface';

import styles from './PersonalWorkspace.module.scss';

export interface PersonalWorkspaceProps {
  workspace: WorkspaceInfo;
  onToggleSwitcher: () => void;
}

const PersonalWorkspace = ({ workspace, onToggleSwitcher }: PersonalWorkspaceProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container} data-cy="personal_workspace_section">
      <div className={styles.header}>
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {t('workspaceSwitcher.personalWorkspace')}
        </Text>
      </div>
      <div className={styles.body}>
        <RouterLink
          className={styles.personalWorkspaceItem}
          to="/documents"
          onClick={onToggleSwitcher}
          data-cy="personal_workspace_item"
        >
          <Avatar
            size="sm"
            variant="outline"
            src={avatarUtils.getAvatar(workspace.avatarRemoteId) || DefaultOrgAvatar}
            name={workspace.name}
          />
          <PlainTooltip content={workspace.name} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
            <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)" ellipsis>
              {workspace.name}
            </Text>
          </PlainTooltip>
        </RouterLink>
      </div>
    </div>
  );
};

export default PersonalWorkspace;
