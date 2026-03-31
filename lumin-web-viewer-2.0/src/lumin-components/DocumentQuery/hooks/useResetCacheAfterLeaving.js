import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { cache } from 'src/apollo';

const APOLLO_CACHE_QUERIES = ['getOrganizationDocuments', 'getDocuments', 'getOrganizationTeamDocuments'];

const useResetCacheAfterLeaving = () => {
  const location = useLocation();
  useEffect(
    () => () => {
      APOLLO_CACHE_QUERIES.forEach((query) => {
        cache.evict({
          fieldName: query,
          broadcast: false,
        });
      });
      cache.gc();
    },
    [location.pathname]
  );
};

export default useResetCacheAfterLeaving;
