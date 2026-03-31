import { useMemo } from 'react';

import { useGetCurrentOrganization } from 'hooks';

export const useGetScimEnabled = () => {
  const currentOrganization = useGetCurrentOrganization();
  return useMemo(() => !!currentOrganization?.sso?.scimSsoClientId, [currentOrganization]);
};
