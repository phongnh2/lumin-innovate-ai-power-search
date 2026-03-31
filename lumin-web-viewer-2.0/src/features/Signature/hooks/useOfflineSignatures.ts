import { useMemo } from 'react';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

export const useOfflineSignatures = () => {
  const signatures = useShallowSelector(selectors.getUserSignatures);

  return useMemo(() => signatures.filter((signature) => !signature.remoteId), [signatures]);
};
