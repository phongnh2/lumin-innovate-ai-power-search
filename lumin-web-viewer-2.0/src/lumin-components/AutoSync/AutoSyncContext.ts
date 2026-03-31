import { DebouncedFunc } from 'lodash';
import { createContext } from 'react';

export const AutoSyncContext = createContext<{
  isSyncing: boolean;
  setIsSyncing: (isSyncing: boolean) => void;
  sync: DebouncedFunc<(action: string) => void>;
  isFileContentChanged: boolean;
  handleSyncFile: DebouncedFunc<() => void>;
  hasChangeToSync: boolean;
  showErrorModal: (message: unknown) => void;
}>(undefined);
