import { DebouncedFunc } from 'lodash';
import { useContext, useEffect } from 'react';

import { AutoSyncContext } from 'lumin-components/AutoSync/AutoSyncContext';

import { SYNC_RESULT } from 'constants/autoSyncConstant';

type Props = {
  onSyncSuccess?: (data: { action: string; hasBackupToS3?: boolean }) => void;
  onError?: (action: string, reason: string) => void;
};

type AutoSyncType = {
  isSyncing?: boolean;
  setIsSyncing?: (isSyncing: boolean) => void;
  sync?: DebouncedFunc<(action?: string, { forceSync }?: { forceSync?: boolean }) => void>;
  isFileContentChanged?: boolean;
  handleSyncFile?: DebouncedFunc<(actionId?: string) => void>;
  hasChangeToSync?: boolean;
  showErrorModal?: (message: unknown) => void;
};

export const useAutoSync = (props: Props = {}): AutoSyncType => {
  const { onSyncSuccess = () => {}, onError = () => {} } = props;
  const context = useContext<AutoSyncType>(AutoSyncContext);

  useEffect(() => {
    const handleSyncResult = (
      event: CustomEvent<{
        status: string;
        action: string;
        reason: string;
        hasBackupToS3?: boolean;
      }>
    ) => {
      if (event.detail.status === SYNC_RESULT.SUCCESS) {
        onSyncSuccess({ action: event.detail.action, hasBackupToS3: event.detail.hasBackupToS3 });
      }
      if (event.detail.status === SYNC_RESULT.FAIL) {
        onError(event.detail.action, event.detail.reason);
      }
    };
    window.addEventListener('finishSyncDrive', handleSyncResult);
    return () => {
      window.removeEventListener('finishSyncDrive', handleSyncResult);
    };
  }, []);
  return context ?? {};
};

export default useAutoSync;
