import { useWindowEvent, useDebouncedCallback } from '@mantine/hooks';
import isEmpty from 'lodash/isEmpty';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import documentServices from 'services/documentServices';

import { isAutoSync } from 'helpers/autoSync';
import getCurrentRole from 'helpers/getCurrentRole';
import logger from 'helpers/logger';

import useSyncThirdParty from 'features/Annotation/hooks/useSyncThirdParty';
import { useSyncDocumentChecker } from 'features/Document/hooks/useSyncDocumentChecker';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { DOCUMENT_ROLES, LOGGER, STORAGE_TYPE } from 'constants/lumin-common';
import { SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';

import { useShallowSelector } from './useShallowSelector';

const SYNC_DOCUMENT_DELAY = 5000;

export const useSyncDocumentHandler = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const canModifyDriveContent = useSelector(selectors.canModifyDriveContent);
  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const { handleSyncThirdParty } = useSyncThirdParty();
  const { canSync } = useSyncDocumentChecker();

  const isSystemFile = currentDocument?.isSystemFile;
  const currentRole = getCurrentRole(currentDocument);
  const canEditDocument = [DOCUMENT_ROLES.EDITOR, DOCUMENT_ROLES.SHARER, DOCUMENT_ROLES.OWNER].includes(currentRole);
  const isGoogleAutoSyncEnabled =
    !isEmpty(currentDocument) && isAutoSync(currentDocument) && currentDocument?.enableGoogleSync;

  const saveToS3 = async () => {
    await documentServices.syncFileToS3Exclusive(currentDocument, {
      increaseVersion: true,
      action: SAVE_OPERATION_TYPES.CONTENT_EDIT,
    });
  };

  const debounceSyncDocument = useDebouncedCallback(async () => {
    try {
      if (!isDocumentLoaded || !canEditDocument || isGoogleAutoSyncEnabled || !canSync || isSystemFile) {
        return;
      }

      switch (currentDocument.service) {
        case STORAGE_TYPE.S3: {
          await saveToS3();
          break;
        }
        case STORAGE_TYPE.ONEDRIVE:
        case STORAGE_TYPE.GOOGLE: {
          if (!canModifyDriveContent) {
            break;
          }
        }
        // eslint-disable-next-line no-fallthrough
        case STORAGE_TYPE.DROPBOX: {
          await handleSyncThirdParty();
          break;
        }
        default:
          break;
      }
    } catch (error) {
      logger.logError({
        reason: LOGGER.Service.SYNC_DOCUMENT_ON_OUTLINES_CHANGED,
        message: 'Failed to sync document on outlines changed',
        error: error as Error,
      });
    }
  }, SYNC_DOCUMENT_DELAY);

  useWindowEvent(CUSTOM_EVENT.SYNC_DOCUMENT, debounceSyncDocument);
};
