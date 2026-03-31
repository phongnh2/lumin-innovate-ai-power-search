import PropTypes from 'prop-types';
import React from 'react';

import SettingSection from 'lumin-components/SettingSection';
import SvgElement from 'lumin-components/SvgElement';

import { useTabletMatch, useTranslation } from 'hooks';

import { organizationServices } from 'services';

import { bytesToSize } from 'utils';

import { maximumAvatarSize } from 'constants/customConstant';

const maximumAvatarSizeText = bytesToSize(maximumAvatarSize.TEAM, { separator: '', digits: 0 });

function EditTeamProfile({ team, updateTeam }) {
  const { t } = useTranslation();
  const isTabletUp = useTabletMatch();

  const withUpdateTeam = async (callback) => {
    const newTeam = await callback();
    updateTeam(newTeam);
    return newTeam;
  };

  const onUploadAvatar = async (profileId, file) => withUpdateTeam(() => organizationServices.editOrganizationTeam({
    teamId: profileId,
    team: {
      name: team.name,
    },
    file,
  }));
  const onRemoveAvatar = (profileId) => withUpdateTeam(() => organizationServices.editOrganizationTeam({
    teamId: profileId,
    team: {
      name: team.name,
      avatarRemoteId: '',
    },
  }));
  const onEditName = (profileId, newName) => withUpdateTeam(() => organizationServices.editOrganizationTeam({
    teamId: profileId,
    team: {
      name: newName,
    },
  }));
  const size = isTabletUp ? 80 : 64;

  const text = {
    title: t('teamInsight.teamProfile'),
    note: t('teamInsight.uploadTeamLogo', {
      text: maximumAvatarSizeText,
    }),
  };

  return (
    <SettingSection.EditProfile
      title={text.title}
      defaultAvatar={<SvgElement content="team-dummy" width={size} />}
      maxSize={maximumAvatarSize.TEAM}
      note={text.note}
      avatarRemoteId={team.avatarRemoteId}
      defaultName={team.name}
      profileId={team._id}
      onUploadAvatar={onUploadAvatar}
      onRemoveAvatar={onRemoveAvatar}
      onEditName={onEditName}
    />
  );
}

EditTeamProfile.propTypes = {
  team: PropTypes.object.isRequired,
  updateTeam: PropTypes.func.isRequired,
};

export default EditTeamProfile;
