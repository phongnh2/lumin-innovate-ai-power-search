import { Dispatch, useState } from 'react';

import { environment } from '@/configs/environment';
import { ORGANIZATION_SEGMENT, TEAMS_SEGMENT } from '@/constants/common';
import { useGetOrganizationAndTeamOwnerMutation } from '@/features/account/account-api-slice';
import { Overwrite } from '@/interfaces/custom-type';
import { IOrganization } from '@/interfaces/organization';
import { ITeam } from '@/interfaces/team';

import { TTransformResource } from '../interfaces';

interface IProps {
  setOpenDialog: Dispatch<boolean>;
  setShowDeleteModal: Dispatch<boolean>;
}

type TeamResponse = Overwrite<ITeam, { belongsTo: IOrganization }>;

const useFetchOwnTeamAndOrg = ({ setOpenDialog, setShowDeleteModal }: IProps) => {
  const [ownerResources, setOwnerResources] = useState<{ orgTeams: TTransformResource[]; organizations: TTransformResource[] }>({
    orgTeams: [],
    organizations: []
  });
  const [getOrganizationAndTeamOwner, { isLoading, isSuccess }] = useGetOrganizationAndTeamOwnerMutation();

  const fetchTeamAndOrganizationOwner = async (): Promise<void> => {
    const data = await getOrganizationAndTeamOwner().unwrap();
    const { organizationOwner, teamOwner } = data;

    setOwnerResources({
      orgTeams: transformTeamResource(teamOwner || []),
      organizations: transformOrganizationResource(organizationOwner || [])
    });

    const hasAnyOwnOrganizationOrTeam = organizationOwner.length || teamOwner.length;

    if (hasAnyOwnOrganizationOrTeam) {
      setOpenDialog(true);
    } else {
      setShowDeleteModal(true);
    }
  };
  return {
    ownerResources,
    fetchTeamAndOrganizationOwner,
    loading: isLoading,
    isSuccess
  };
};

function transformTeamResource(teams: TeamResponse[]) {
  return teams.map(({ _id, name, avatarRemoteId, belongsTo }: TeamResponse) => ({
    _id,
    name,
    avatarRemoteId,
    url: new URL(`/${ORGANIZATION_SEGMENT}/${belongsTo.url}/${TEAMS_SEGMENT}/${_id}`, environment.public.host.appUrl).toString(),
    subName: belongsTo?.name
  }));
}

function transformOrganizationResource(organizations: IOrganization[]) {
  return organizations.map(({ _id, name, url, avatarRemoteId }) => ({
    _id,
    name,
    avatarRemoteId,
    url: new URL(`/${ORGANIZATION_SEGMENT}/${url}/members`, environment.public.host.appUrl).toString()
  }));
}

export default useFetchOwnTeamAndOrg;
