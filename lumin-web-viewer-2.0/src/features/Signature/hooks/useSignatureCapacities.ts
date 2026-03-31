import { useNetworkStatus } from 'hooks/useNetworkStatus';

import { useGetSignatures } from './useGetSignatures';
import { Signature, SignatureSyncStatus } from '../interfaces';

export const useSignatureCapacities = () => {
  const { signatures } = useGetSignatures();
  const { isOffline, isOnline } = useNetworkStatus();

  const isLocalSignatureInOnlineMode = (remoteId: Signature['remoteId']) => isOnline && !remoteId;

  const isRemoteSignatureInOfflineMode = (remoteId: Signature['remoteId']) => isOffline && remoteId;

  const hasAnyOfflineSignature = signatures.some(({ remoteId }) => !remoteId);

  const isItemSyncing = (status: SignatureSyncStatus) => status === 'syncing';

  const canItemDelete = ({ remoteId, status }: { remoteId: Signature['remoteId']; status: SignatureSyncStatus }) =>
    !isLocalSignatureInOnlineMode(remoteId) && !isRemoteSignatureInOfflineMode(remoteId) && !isItemSyncing(status);

  const isItemDisabled = ({ status }: { status: SignatureSyncStatus }) => isItemSyncing(status);

  const canReorder = () => isOnline && !hasAnyOfflineSignature;

  return {
    canReorder,
    canItemDelete,
    isItemSyncing,
    isItemDisabled,
  };
};
