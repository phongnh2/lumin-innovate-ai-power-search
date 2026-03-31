import { Avatar, Icomoon, Text, Divider, Popover, PopoverTarget, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router';

import { useRenderWorkspaceSwitcher } from '@web-new-ui/components/WorkspaceSwitcher';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';

import { useGetCurrentOrganization, usePersonalWorkspaceLocation, useTranslation } from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { matchPaths } from 'helpers/matchPaths';

import { avatar as avatarUtils } from 'utils';
import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { AWS_EVENTS } from 'constants/awsEvents';
import { TOOLTIP_OPEN_DELAY, TOOLTIP_MAX_WIDTH } from 'constants/lumin-common';
import { ORGANIZATION_ROUTERS } from 'constants/organizationConstants';

import { ModalTypes } from '../../LeftSidebarDrawer.constants';
import { NavigationItem } from '../NavigationItem';

import styles from './OrganizationSwitcher.module.scss';

type OrganizationSwitcherProps = {
  toggleModalType: (type: ModalTypes) => void;
  onCloseDrawer: () => void;
};

const OrganizationSwitcher = ({ toggleModalType, onCloseDrawer }: OrganizationSwitcherProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const currentUser = useGetCurrentUser();
  const currentOrganization = useGetCurrentOrganization();
  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();

  const { render, opened, setOpened } = useRenderWorkspaceSwitcher({ onCloseDrawer });
  const { onKeyDown } = useKeyboardAccessibility();

  const orgRouteMatch = matchPaths(
    ORGANIZATION_ROUTERS.map((path) => ({ path, end: false })),
    location.pathname
  );

  const workspaceInfo = useMemo(() => {
    if (!currentUser?._id) return {};

    if (orgRouteMatch) {
      if (!currentOrganization) return {};
      return {
        name: currentOrganization.name,
        avatarUrl: avatarUtils.getAvatar(currentOrganization.avatarRemoteId) || DefaultOrgAvatar,
      };
    }
    return {
      name: currentUser.name,
      avatarUrl: avatarUtils.getAvatar(currentUser.avatarRemoteId),
    };
  }, [currentOrganization, currentUser, orgRouteMatch]);

  const togglePopover = () => setOpened((prevState) => !prevState);

  return (
    // TODO: temporarily set zIndex to 302 to avoid conflict with Promote Templates Popover, please remove this after Promote Templates Popover is deprecated
    <Popover width="var(--workspace-switcher-width)" opened={opened} onChange={setOpened} trapFocus returnFocus zIndex={302}>
      <PopoverTarget>
        <div
          role="button"
          tabIndex={0}
          data-cy="organization_switcher_drawer"
          data-lumin-btn-name={NavigationNames.WORKSPACE_SWITCHER}
          data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
          data-disabled="false"
          data-toggled={opened}
          className={styles.containerVariantB}
          onClick={togglePopover}
          onKeyDown={onKeyDown}
        >
          <div className={styles.wrapper}>
            <Avatar
              variant="outline"
              size="sm"
              src={workspaceInfo.avatarUrl}
              name={workspaceInfo.name}
              alt="Org Avatar"
            />
            <PlainTooltip
              content={workspaceInfo.name}
              openDelay={TOOLTIP_OPEN_DELAY}
              maw={TOOLTIP_MAX_WIDTH}
              className={styles.nameWrapper}
            >
              <Text component="h1" type="headline" size="sm" color="var(--kiwi-colors-surface-on-surface)" ellipsis>
                {workspaceInfo.name}
              </Text>
            </PlainTooltip>
            <Icomoon color="var(--kiwi-colors-surface-on-surface)" type="caret-down-filled-md" size="md" />
          </div>
        </div>
      </PopoverTarget>
      <div tabIndex={-1} className={styles.inviteBtnContainer}>
        {!isAtPersonalWorkspace && (
          <NavigationItem
            data-cy="invite_members_button_drawer"
            data-lumin-btn-name={NavigationNames.INVITE_WORKSPACE_MEMBER}
            data-lumin-btn-event-type={AWS_EVENTS.NAVIGATION}
            icon="user-plus-lg"
            title={t('memberPage.invite')}
            onClick={() => toggleModalType(ModalTypes.Invite_Members)}
          />
        )}
      </div>
      <Divider />
      {render()}
    </Popover>
  );
};

export default OrganizationSwitcher;
