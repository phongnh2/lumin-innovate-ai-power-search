import { Avatar, PlainTooltip, Popover, PopoverTarget } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import PopperContent from 'luminComponents/ProfileButton/components/PopperContent';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';
import { useTranslation } from 'hooks/useTranslation';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { avatar } from 'utils';

const ProfileDropdown = () => {
  const [opened, setOpened] = useState(false);
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const { isViewer } = useViewerMatch();

  const { onKeyDown } = useKeyboardAccessibility();

  return (
    <Popover
      width="var(--workspace-switcher-width)"
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      returnFocus
      trapFocus
    >
      <PopoverTarget>
        <PlainTooltip content={t('settingGeneral.account')} position="bottom" disabled={opened}>
          <Avatar
            role="button"
            tabIndex={0}
            onClick={() => setOpened((o) => !o)}
            onKeyDown={onKeyDown}
            variant="outline"
            src={avatar.getAvatar(currentUser.avatarRemoteId)}
            name={currentUser.name}
            size={isViewer ? 36 : 'sm'}
            data-cy="profile_dropdown_avatar"
          />
        </PlainTooltip>
      </PopoverTarget>
      <PopperContent onClose={() => setOpened(false)} />
    </Popover>
  );
};

export default ProfileDropdown;
