import { useSubscribeSignatures, useSyncOfflineSignatures } from 'features/Signature';

export const useSignatureHandlers = () => {
  useSyncOfflineSignatures();

  useSubscribeSignatures();
};
