import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useGetCurrentOrganization } from 'hooks';

import { getListOAuth2Clients } from 'features/DeveloperApi/apis/oauth2';
import { OAuth2Client } from 'features/DeveloperApi/interfaces';

export const useFetchingOAuthClients = () => {
  const currentOrganization = useGetCurrentOrganization();
  const [oauth2Clients, setOauth2Clients] = useState<OAuth2Client[]>([]);

  const {
    data: fetchedOAuth2Clients,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['oauth2-clients', currentOrganization?._id],
    queryFn: () => getListOAuth2Clients({ workspaceId: currentOrganization?._id || '' }),
    enabled: !!currentOrganization?._id,
  });

  useEffect(() => {
    if (isLoading || !fetchedOAuth2Clients || isFetching) {
      return;
    }

    setOauth2Clients(fetchedOAuth2Clients);
  }, [fetchedOAuth2Clients, isLoading, isFetching]);

  useEffect(() => {
    refetch();
  }, []);

  return {
    oauth2Clients,
    setOauth2Clients,
    isFetchingListClients: isLoading || isFetching,
  };
};
