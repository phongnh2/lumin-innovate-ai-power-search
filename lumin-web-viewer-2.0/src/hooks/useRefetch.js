import React from 'react';

export function useRefetch(
  refetch,
) {
  const [refetching, setRefetching] = React.useState(false);
  const refetchWithLoading = React.useCallback(
    (...args) => {
      setRefetching(true);
      return refetch(...args).finally(() => {
        setRefetching(false);
      });
    },
    [refetch],
  );

  return [refetchWithLoading, refetching];
}
