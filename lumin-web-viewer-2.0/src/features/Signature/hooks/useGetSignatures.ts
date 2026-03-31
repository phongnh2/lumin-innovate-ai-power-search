import { useMemo } from 'react';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

export const useGetSignatures = () => {
  const userSignatures = useShallowSelector(selectors.getUserSignatures);

  return useMemo(
    () => ({
      signatures: userSignatures,
    }),
    [userSignatures]
  );
};
