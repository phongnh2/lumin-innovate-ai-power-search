import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { useNetworkStatus } from 'hooks/useNetworkStatus';
import useShallowSelector from 'hooks/useShallowSelector';

import { indexedDBService } from 'services';

import signatureUtils from 'utils/signature';

import { socket } from '@socket';

import { ErrorCode } from 'constants/errorCode';
import { SOCKET_EMIT, SOCKET_ON } from 'constants/socketConstant';

import { Signature, SignatureServerResponse } from '../interfaces';

export const useSignatureRealtime = () => {
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const { isOffline } = useNetworkStatus();
  const dispatch = useDispatch();

  const addSignatureCallback = useCallback(
    ({ newSignature, signatureId }: { newSignature: { remoteId: Signature['remoteId'] }; signatureId: string }) => {
      dispatch(
        actions.updateSignatureById(signatureId, {
          remoteId: newSignature.remoteId,
          status: null,
        })
      );
    },
    [dispatch]
  );

  const addSignatureEventTrigger = ({
    getSignedUrl,
    encodeSignatureData,
    id: signatureId,
  }: {
    getSignedUrl: string;
    encodeSignatureData: string;
    id: string;
  }) => {
    if (isOffline || !currentUser?._id) {
      return;
    }
    socket.emit(
      SOCKET_EMIT.ADD_NEW_SIGNATURE,
      {
        _id: currentUser._id,
        signedUrl: getSignedUrl,
        encodeSignature: encodeSignatureData,
        signatureId,
      },
      ({ newSignature }: { newSignature: { remoteId: Signature['remoteId'] } }) =>
        addSignatureCallback({ newSignature, signatureId })
    );
  };

  const createSignature = async (newSignature: SignatureServerResponse): Promise<Signature> => {
    const imageData = await signatureUtils.getBase64FromUrl({
      imageData: newSignature.signedUrl,
      remoteId: newSignature.remoteId,
    });
    return {
      id: newSignature.id,
      ...imageData,
    };
  };

  const addSignaturesListener = useCallback(
    async ({ errorCode = '', newSignature }: { errorCode: string; newSignature: SignatureServerResponse }) => {
      const exceededLimit = errorCode === ErrorCode.User.EXCEEDED_LIMIT_CREATE_SIGNATURE;
      if (!exceededLimit && newSignature.remoteId) {
        const newSignatureData = await createSignature(newSignature);
        dispatch(actions.addSignatures([newSignatureData]));
        await indexedDBService.addSignature(newSignatureData);
      }
    },
    [dispatch]
  );

  const deleteSignaturesListener = useCallback(
    ({ remoteId }: { remoteId: string }) => {
      dispatch(actions.deleteUserRemoteSignature(remoteId));
    },
    [dispatch]
  );

  const addSignatureEventListener = useCallback(() => {
    if (!currentUser?._id) {
      return;
    }
    socket.on(`${SOCKET_ON.ADD_NEW_SIGNATURE}-${currentUser._id}`, addSignaturesListener);
    socket.on(SOCKET_ON.REMOVE_USER_SIGNATURE, deleteSignaturesListener);
  }, [addSignaturesListener, deleteSignaturesListener, currentUser?._id]);

  const removeSignatureEventListener = () => {
    socket.removeListener({
      message: `${SOCKET_ON.ADD_NEW_SIGNATURE}-${currentUser._id}`,
      listener: addSignaturesListener,
    });
    socket.removeListener({ message: SOCKET_ON.REMOVE_USER_SIGNATURE, listener: deleteSignaturesListener });
  };

  return {
    addSignatureEvent: {
      trigger: addSignatureEventTrigger,
      listener: addSignatureEventListener,
      destroy: removeSignatureEventListener,
    },
  };
};
