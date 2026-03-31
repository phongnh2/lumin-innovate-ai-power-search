import classNames from 'classnames';
import { Avatar, PlainTooltip, Popover, PopoverTarget } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useRenderWorkspaceSwitcher } from '@web-new-ui/components/WorkspaceSwitcher';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import { useGetOrganizationList, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';

import styles from '../../MainSidebar.module.scss';

interface WorkspaceAvatarProps {
  src: string;
  alt: string;
}

const WorkspaceAvatar = (props: WorkspaceAvatarProps) => {
  const { src, alt } = props;
  const { t } = useTranslation();

  const { organizationList } = useGetOrganizationList();

  const isMultipleWorkspaces = organizationList.length > 1;

  const { render, opened, setOpened } = useRenderWorkspaceSwitcher({ onCloseDrawer: () => {} });
  const { onKeyDown } = useKeyboardAccessibility();

  const togglePopover = () => setOpened((prevState) => !prevState);

  return (
    // TODO: temporarily set zIndex to 302 to avoid conflict with Promote Templates Popover, please remove this after Promote Templates Popover is deprecated
    <Popover width="var(--workspace-switcher-width)" opened={opened} onChange={setOpened} trapFocus returnFocus zIndex={302}>
      <PopoverTarget>
        <PlainTooltip
          content={t('sidebar.sidebarOwnerPane.switchOrg')}
          position="bottom-start"
          disabled={!isMultipleWorkspaces || opened}
        >
          <div className={classNames({ [styles.multipleWorkspace]: isMultipleWorkspaces, [styles.hide]: opened })}>
            <Avatar
              role="button"
              tabIndex={0}
              src={src || DefaultOrgAvatar}
              placeholder={<img src={DefaultOrgAvatar} alt="workspace avatar" />}
              alt={alt}
              radius="md"
              variant="outline"
              onClick={togglePopover}
              onKeyDown={onKeyDown}
              data-cy="workspace_avatar"
              data-lumin-btn-name={NavigationNames.WORKSPACE_SWITCHER}
              data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
            />
          </div>
        </PlainTooltip>
      </PopoverTarget>
      {render()}
    </Popover>
  );
};

export default WorkspaceAvatar;
