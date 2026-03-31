import { useCallback, useMemo } from 'react';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import indexedDBService from 'services/indexedDBService';

export const useBackupSignatures = () => {
  const signatures = useShallowSelector(selectors.getUserSignatures);

  const backup = useCallback(async () => {
    await indexedDBService.updateSignatures(signatures);
  }, [signatures]);

  return useMemo(
    () => ({
      backup,
    }),
    [backup]
  );
};
