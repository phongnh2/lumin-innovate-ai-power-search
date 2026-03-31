import { useMemo } from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';
import DefaultTeamAvatar from 'assets/reskin/lumin-svgs/default-team-avatar.png';

import { useGetCurrentOrganization } from 'hooks';

import { avatar } from 'utils';

import { folderType } from 'constants/documentConstants';

import { Option } from '../interfaces';

const useGetTeamOptions = () => {
  const currentOrg = useGetCurrentOrganization();

  const options = useMemo(() => {
    if (!currentOrg) {
      return [];
    }
    const teams = currentOrg.teams.map((team) => ({
      value: team._id,
      label: team.name,
      folderType: folderType.TEAMS,
      avatar: avatar.getAvatar(team.avatarRemoteId) || DefaultTeamAvatar,
    }));
    return [
      {
        value: currentOrg._id,
        label: `All ${currentOrg.name}`,
        folderType: folderType.ORGANIZATION,
        avatar: avatar.getAvatar(currentOrg.avatarRemoteId) || DefaultOrgAvatar,
      },
      ...teams,
    ] as Option[];
  }, [currentOrg]);

  return { options, teams: currentOrg?.teams || [] };
};

export default useGetTeamOptions;
