import React, { createContext, useContext, useMemo, useState } from 'react';

export const SyncedQueueContext = createContext<{
  changedQueue: string[];
  setQueue: React.Dispatch<React.SetStateAction<string[]>>;
} | null>(null);

export const SyncedQueueProvider = ({ children }: { children: React.ReactNode }) => {
  const [changedQueue, setQueue] = useState<string[]>([]);
  const memoizedValue = useMemo(() => ({ changedQueue, setQueue }), [changedQueue]);

  return <SyncedQueueContext.Provider value={memoizedValue}>{children}</SyncedQueueContext.Provider>;
};

export const useSyncedQueueContext = () => {
  const context = useContext(SyncedQueueContext);

  if (!context) {
    throw new Error('useSyncedQueueContext must be used within a SyncedQueueProvider');
  }

  return context;
};
