import { useDispatch } from 'react-redux';

import actions from 'actions';

import userServices from 'services/userServices';

import { useGetSignatures } from './useGetSignatures';

export const useReorderSignature = () => {
  const { signatures } = useGetSignatures();
  const dispatch = useDispatch();

  const reorder = async ({ startIndex, endIndex }: { startIndex: number; endIndex: number }) => {
    if (startIndex === endIndex) {
      return;
    }
    const signatureRemoteId = signatures[startIndex]?.remoteId;
    dispatch(actions.reorderSignature(startIndex, endIndex));
    await userServices.updateSignaturePosition({
      signatureRemoteId,
      toPosition: endIndex,
    });
  };

  return {
    reorder,
  };
};
