import { Avatar, Button, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import { useTranslation } from 'hooks';

import { avatar as avatarUtils } from 'utils';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import { TOOLTIP_OPEN_DELAY, TOOLTIP_MAX_WIDTH } from 'constants/lumin-common';
import { MAX_DISPLAY_WORKSPACES_ON_SWITCHER, ORG_TEXT } from 'constants/organizationConstants';

import { OrganizationListData } from 'interfaces/redux/organization.redux.interface';

import styles from './UserWorkspaces.module.scss';

export interface UserWorkspacesProps {
  workspaces: OrganizationListData[];
  onToggleSwitcher: () => void;
}

const UserWorkspaces = ({ workspaces, onToggleSwitcher }: UserWorkspacesProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const renderWorkspaceItems = useMemo(() => {
    const updatedWorkspaces = workspaces.slice(0, MAX_DISPLAY_WORKSPACES_ON_SWITCHER);
    return updatedWorkspaces.map(({ organization }) => (
      <RouterLink
        className={styles.workspaceItem}
        key={organization._id}
        to={getDefaultOrgUrl({ orgUrl: organization.url })}
        onClick={onToggleSwitcher}
        data-cy={`workspace_${organization._id}`}
      >
        <div className={styles.workspaceItemInfo}>
          <Avatar
            size="sm"
            variant="outline"
            src={avatarUtils.getAvatar(organization.avatarRemoteId) || DefaultOrgAvatar}
            name={organization.name}
          />
          <PlainTooltip content={organization.name} maw={TOOLTIP_MAX_WIDTH} openDelay={TOOLTIP_OPEN_DELAY}>
            <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)" ellipsis>
              {organization.name}
            </Text>
          </PlainTooltip>
        </div>
      </RouterLink>
    ));
  }, [onToggleSwitcher, workspaces]);

  return (
    <div className={styles.container} data-cy="user_workspaces_section">
      <div className={styles.header}>
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {t('workspaceSwitcher.yourWorkspaces')}
        </Text>
        <PlainTooltip content={t('workspaceSwitcher.tooltipViewAllWorkspaces')}>
          <Button variant="text" size="sm" onClick={() => navigate(`/${ORG_TEXT}s`)} data-cy="view_all_button">
            {t('workspaceSwitcher.viewAll')}
          </Button>
        </PlainTooltip>
      </div>
      <div className={styles.body}>{renderWorkspaceItems}</div>
    </div>
  );
};

export default UserWorkspaces;
