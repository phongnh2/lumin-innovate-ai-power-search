import { useDispatch } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { saveLocalFile } from 'lumin-components/ViewerCommon/LocalSave/helper/saveLocalFile';

import { useShallowSelector } from 'hooks';
import { useTranslation } from 'hooks/useTranslation';

import documentServices from 'services/documentServices';

import fireEvent from 'helpers/fireEvent';
import logger from 'helpers/logger';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import useSyncThirdParty from 'features/Annotation/hooks/useSyncThirdParty';

import { documentStorage } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';

const useApplyRedaction = () => {
  const dispatch = useDispatch();
  const { handleSyncThirdParty } = useSyncThirdParty();
  const { t } = useTranslation();

  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const applyRedact = async (
    annotation: Core.Annotations.RedactionAnnotation | Core.Annotations.RedactionAnnotation[]
  ) => {
    try {
      if (annotation instanceof Array) {
        annotation.forEach((annot) => {
          const fillColor = annot.FillColor;
          annot.Color = new window.Core.Annotations.Color(fillColor.R, fillColor.G, fillColor.B, fillColor.A);
        });
        await core.applyRedactions(annotation);
        return;
      }
      const fillColor = annotation.FillColor;
      annotation.Color = new window.Core.Annotations.Color(fillColor.R, fillColor.G, fillColor.B, fillColor.A);
      await core.applyRedactions([annotation]);
    } catch (error: unknown) {
      logger.logError({
        reason: LOGGER.Service.REDACT_DOCUMENT,
        message: 'Failed to get document instance for redaction feature!',
        error,
      });
      throw error;
    }
  };

  const syncFile = async () => {
    try {
      switch (currentDocument.service) {
        case documentStorage.s3:
          await documentServices.syncFileToS3Exclusive(currentDocument, {
            increaseVersion: true,
          });
          fireEvent('refetchDocument');
          break;
        case documentStorage.system:
          saveLocalFile();
          break;
        case documentStorage.onedrive:
        case documentStorage.dropbox:
          await handleSyncThirdParty();
          break;
        default:
          break;
      }
    } catch (error: unknown) {
      logger.logError({
        reason: LOGGER.Service.REDACT_DOCUMENT,
        message: 'Failed to get document instance for redaction feature!',
        error,
      });
      enqueueSnackbar({
        variant: 'error',
        message: t('viewer.header.failedToSyncYourDocument'),
      });
      throw error;
    }
  };

  return async (annotation: Core.Annotations.RedactionAnnotation | Core.Annotations.RedactionAnnotation[]) => {
    const modalEventData = {
      modalName: ModalName.APPLY_REDACTION,
      modalPurpose: ModalPurpose[ModalName.APPLY_REDACTION],
    };
    modalEvent.modalConfirmation(modalEventData).catch(() => {});
    dispatch(actions.closeModal());
    try {
      await applyRedact(annotation);
      await syncFile();
    } finally {
      dispatch(actions.closeModal());
    }
  };
};

export default useApplyRedaction;
