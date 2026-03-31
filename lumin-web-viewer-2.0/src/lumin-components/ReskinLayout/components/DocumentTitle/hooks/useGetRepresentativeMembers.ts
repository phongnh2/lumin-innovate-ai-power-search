import { useState, useEffect } from 'react';

import { useGetCurrentOrganization, useGetCurrentTeam } from 'hooks';

import { organizationServices } from 'services';

import { ITeam } from 'interfaces/team/team.interface';
import { IUser } from 'interfaces/user/user.interface';

type RepresentativeMembers = Pick<IUser, '_id' | 'name' | 'email' | 'avatarRemoteId'>;

type UseGetRepresentativeMembersData = {
  isFetching: boolean;
  representativeMembers: RepresentativeMembers[];
};

const useGetRepresentativeMembers = (): UseGetRepresentativeMembersData => {
  const [isFetching, setIsFetching] = useState(true);
  const [representativeMembers, setRepresentativeMembers] = useState<RepresentativeMembers[]>([]);

  const currentTeam = useGetCurrentTeam() as ITeam;
  const currentOrganization = useGetCurrentOrganization();

  useEffect(() => {
    const getRepresentativeMembers = async () => {
      if (!currentOrganization?._id) {
        setRepresentativeMembers([]);
        return;
      }
      try {
        setIsFetching(true);
        const data = await organizationServices.getRepresentativeMembers({
          orgId: currentOrganization._id,
          teamId: currentTeam?._id,
        });
        setRepresentativeMembers(data?.representativeMembers || []);
      } catch (error) {
        /* empty */
      }
    };
    getRepresentativeMembers().finally(() => {
      setIsFetching(false);
    });
  }, [currentOrganization?._id, currentTeam?._id]);

  return { representativeMembers, isFetching };
};

export default useGetRepresentativeMembers;
