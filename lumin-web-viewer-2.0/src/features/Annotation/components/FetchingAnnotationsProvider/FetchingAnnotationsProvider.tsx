import React, { useMemo } from 'react';

import { FetchingAnnotationsContext } from 'features/Annotation/contexts';
import { useFetchingAnnotationsStore } from 'features/Annotation/hooks';

type FetchingAnnotationsProviderProps = {
  children: React.ReactNode;
};

const FetchingAnnotationsProvider = ({ children }: FetchingAnnotationsProviderProps) => {
  const { annotations, setAnnotations } = useFetchingAnnotationsStore();
  const contextValues = useMemo(
    () => ({
      annotations,
      setAnnotations,
    }),
    [annotations, setAnnotations]
  );

  return <FetchingAnnotationsContext.Provider value={contextValues}>{children}</FetchingAnnotationsContext.Provider>;
};

export default FetchingAnnotationsProvider;
