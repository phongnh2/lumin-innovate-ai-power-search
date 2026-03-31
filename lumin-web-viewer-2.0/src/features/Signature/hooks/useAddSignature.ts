import { useDispatch } from 'react-redux';
import { v4 } from 'uuid';

import actions from 'actions';
import selectors from 'selectors';

import { useNetworkStatus } from 'hooks/useNetworkStatus';
import useShallowSelector from 'hooks/useShallowSelector';

import documentServices from 'services/documentServices';
import { documentGraphServices } from 'services/graphServices';
import indexedDBService from 'services/indexedDBService';

import logger from 'helpers/logger';

import fileUtils from 'utils/file';

import { MAXIMUM_NUMBER_SIGNATURE } from 'constants/lumin-common';

import { useGetSignatures } from './useGetSignatures';
import { useSignatureRealtime } from './useSignatureRealtime';
import { DEFAULT_SIGNATURE_SIZE } from '../constants';
import { Signature, SignatureSyncStatus } from '../interfaces';

export const useAddSignature = () => {
  const { signatures } = useGetSignatures();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { addSignatureEvent } = useSignatureRealtime();
  const dispatch = useDispatch();
  const { isOnline } = useNetworkStatus();

  const getMaximumNumberSignature = () =>
    currentDocument ? currentDocument.premiumToolsInfo.maximumNumberSignature : MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN;

  const validateAddSignaturePosibility = () => {
    const maximumNumberSignature = getMaximumNumberSignature();
    return signatures.length < maximumNumberSignature;
  };

  const addNewUserSignature = async (newSignature: Signature) => {
    const signatureIndex = signatures.findIndex((signature) => signature.id === newSignature.id);
    if (signatureIndex !== -1) {
      const updatedSignatures = [...signatures];
      updatedSignatures[signatureIndex] = newSignature;
      dispatch(actions.updateSignatureById(newSignature.id, newSignature));
      await indexedDBService.updateSignatures(updatedSignatures);
      return;
    }
    dispatch(actions.addSignatures([newSignature]));
    await indexedDBService.addSignature(newSignature);
  };

  const prepareDataToSubmit = ({ base64, id }: { base64: string; id: string }) =>
    fileUtils.dataURLtoFile(base64.replaceAll('%0A', ''), id);

  const revertSignatureList = async (oldSignatures: Signature[]) => {
    dispatch(actions.updateUserSignatures(oldSignatures));
    await indexedDBService.updateSignatures(oldSignatures);
  };

  const uploadSignatureToRemote = async ({
    newSignatureFile,
    signatureId,
  }: {
    newSignatureFile: File;
    signatureId: string;
  }) => {
    const { putSignedUrl, getSignedUrl, encodeSignatureData } = await documentGraphServices.getPresignedUrlForSignature(
      newSignatureFile.type
    );
    await documentServices.uploadFileToS3({
      presignedUrl: putSignedUrl,
      file: newSignatureFile,
    });
    addSignatureEvent.trigger({ getSignedUrl, encodeSignatureData, id: signatureId });
  };

  const addSignature = async ({ base64, id, status }: { base64: string; id: string; status: SignatureSyncStatus }) => {
    const backupSignatures = [...signatures];
    try {
      const validated = validateAddSignaturePosibility();
      if (!validated) {
        return;
      }

      const newSignature = {
        imgSrc: base64,
        id,
        index: v4(),
        width: DEFAULT_SIGNATURE_SIZE.WIDTH,
        height: DEFAULT_SIGNATURE_SIZE.HEIGHT,
        status,
      };

      const newSignatureFile = prepareDataToSubmit({ base64, id });
      await addNewUserSignature(newSignature);
      if (isOnline) {
        await uploadSignatureToRemote({ newSignatureFile, signatureId: id });
      }
    } catch (error) {
      revertSignatureList(backupSignatures).catch((err) =>
        logger.logError({ error: err, reason: 'Failed to revert signature list' })
      );
      logger.logError({ error: error as unknown, reason: 'Failed to add signature' });
    }
  };

  return {
    addSignatureMutation: {
      trigger: addSignature,
    },
  };
};
