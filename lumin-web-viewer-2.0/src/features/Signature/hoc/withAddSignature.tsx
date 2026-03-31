import React from 'react';

import { useAddSignature } from '../hooks/useAddSignature';

export const withAddSignature =
  (
    WrappedComponent: React.ComponentType<{
      addSignatureMutation: ReturnType<typeof useAddSignature>['addSignatureMutation'];
    }>
  ) =>
  (props: React.PropsWithChildren) => {
    const addSignatureMethods = useAddSignature();
    return <WrappedComponent {...props} {...addSignatureMethods} />;
  };
