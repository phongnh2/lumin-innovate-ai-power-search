import { Icomoon, Avatar } from 'lumin-ui/kiwi-ui';
import React from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';
import DefaultTeamAvatar from 'assets/reskin/lumin-svgs/default-team-avatar.png';

import { avatar as avatarUtils } from 'utils';

import { RootTypes } from 'features/NestedFolders/constants';

type RootNodeProps = {
  label: string;
  rootType: RootTypes;
  avatarRemoteId: string;
  className?: string;
};

const RootNode = ({ label, rootType, avatarRemoteId, className }: RootNodeProps) => {
  const isPersonal = rootType === RootTypes.Personal;
  const defaultAvatar = rootType === RootTypes.Organization ? DefaultOrgAvatar : DefaultTeamAvatar;
  return isPersonal ? (
    <Icomoon className={className} type="ph-file-text-fill" size="lg" color="var(--kiwi-colors-surface-outline)" />
  ) : (
    <Avatar
      size="xs"
      variant="outline"
      src={avatarUtils.getAvatar(avatarRemoteId) || defaultAvatar}
      name={label}
      className={className}
    />
  );
};

export default RootNode;
