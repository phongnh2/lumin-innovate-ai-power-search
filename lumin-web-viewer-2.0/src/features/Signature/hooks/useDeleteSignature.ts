import { useMutation } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { DELETE_SIGNATURE_BY_REMOTE_ID } from 'graphQL/UserGraph';

import actions from 'actions';

import logger from 'helpers/logger';

export const useDeleteSignature = () => {
  const [deleteSignatureTrigger, deleteSignatureResult] = useMutation(DELETE_SIGNATURE_BY_REMOTE_ID);
  const dispatch = useDispatch();

  const deleteOne = useCallback(
    async (signatureRemoteId: string) => {
      dispatch(
        actions.updateSignatureById(signatureRemoteId, {
          status: 'deleting',
        })
      );
      try {
        await deleteSignatureTrigger({
          variables: { signatureRemoteId },
        });
      } catch (error) {
        logger.logError({ error: error as unknown });
        dispatch(
          actions.updateSignatureById(signatureRemoteId, {
            status: null,
          })
        );
      }
    },
    [deleteSignatureTrigger, dispatch]
  );

  return useMemo(
    () => ({
      deleteOneMutation: {
        trigger: deleteOne,
        ...deleteSignatureResult,
      },
    }),
    [deleteOne, deleteSignatureResult]
  );
};
