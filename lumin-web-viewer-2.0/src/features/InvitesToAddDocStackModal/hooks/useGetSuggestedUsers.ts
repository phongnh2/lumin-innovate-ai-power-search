import { useQuery } from '@tanstack/react-query';

import useGetOrganizationData from 'hooks/useGetOrganizationData';

import { organizationServices, googleServices } from 'services';

import { User } from '../InvitesToAddDocStackModal.types';

const useGetSuggestedUsers = () => {
  const org = useGetOrganizationData();

  const getSuggestedUsersToInvite = async () => {
    if (!org._id) {
      return [];
    }
    const googleImplicitAccessToken = googleServices.getImplicitAccessToken();
    const results = (await organizationServices.getSuggestedUsersToInvite({
      orgId: org._id,
      forceUpdate: true,
      accessToken: googleImplicitAccessToken?.access_token || '',
      googleAuthorizationEmail: googleImplicitAccessToken?.email || '',
    })) as {
      suggestedUsers: User[];
    };
    return results.suggestedUsers;
  };

  const { data, isFetching } = useQuery({
    queryKey: ['suggestedUsersToInvite'],
    queryFn: getSuggestedUsersToInvite,
    enabled: true,
    refetchOnMount: 'always',
  });

  return {
    data,
    isFetching,
  };
};

export default useGetSuggestedUsers;
