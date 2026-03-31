import { Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import selectors from 'selectors';

import CircularLoading from 'lumin-components/CircularLoading';
import Icomoon from 'lumin-components/Icomoon';
import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks';
import { useCleanup } from 'hooks/useCleanup';
import useShallowSelector from 'hooks/useShallowSelector';

import { SYNC_DOCUMENT_THROTTLE_TIME } from 'features/Annotation/constants/forceSync';
import useSyncThirdParty from 'features/Annotation/hooks/useSyncThirdParty';
import { syncThirdPartyHandler } from 'features/Annotation/utils/syncThirdPartyService';
import { documentUploadExternalSelectors, SYNC_STATUS, documentUploadExternalActions } from 'features/DocumentUploadExternal/slices';
import { readAloudSelectors } from 'features/ReadAloud/slices';

import { DocumentStorage } from 'constants/documentConstants';
import { general } from 'constants/documentType';

import * as Styled from './DropboxSyncButton.styled';

const DropboxSyncButton = () => {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isOffline = useSelector(selectors.isOffline);
  const syncStatus = useSelector(documentUploadExternalSelectors.syncStatus);
  const { t } = useTranslation();
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const { handleSyncThirdParty } = useSyncThirdParty();
  const shouldDisabled = syncStatus === SYNC_STATUS.SYNCING || isInReadAloudMode;
  const isPdfFile = currentDocument.mimeType === general.PDF;
  const dispatch = useDispatch();

  const resetSyncStatus = useDebouncedCallback(() => dispatch(documentUploadExternalActions.resetSyncStatus()), SYNC_DOCUMENT_THROTTLE_TIME);

  useEffect(() => {
    syncThirdPartyHandler.setCallback(handleSyncThirdParty);
    return () => {
      syncThirdPartyHandler.destroy();
    };
  }, [handleSyncThirdParty]);

  useEffect(() => {
    if (syncStatus === SYNC_STATUS.SAVED) {
      resetSyncStatus();
    }
  }, [syncStatus]);

  useCleanup(() => {
    resetSyncStatus.cancel();
    dispatch(documentUploadExternalActions.resetSyncStatus());
  }, []);

  const buttonContentMarkup = () => {
    switch (syncStatus) {
      case SYNC_STATUS.SAVED:
        return (
          <>
            <Icomoon className="md_cloud_check" size={24} />
            <span>{t('common.synced')}</span>
          </>
        );
      case SYNC_STATUS.SYNCING:
        return (
          <>
            <CircularLoading color="inherit" size={24} />
            <Styled.SyncStatus $disabled={shouldDisabled || isOffline}>{t('viewer.header.syncing')}</Styled.SyncStatus>
          </>
        );
      default:
        return (
          <>
            <SvgElement content="dropbox-icon" width={24} height={24} />
            {t('viewer.header.sync')}
          </>
        );
    }
  };

  const getTooltipContent = () => {
    if (!isPdfFile) {
      return t('generalLayout.manualSync.fileTypeUnsupported', { documentStorage: DocumentStorage.DROPBOX });
    }
    switch (syncStatus) {
      case SYNC_STATUS.SYNCING:
        return t('action.syncingInProgress');
      case SYNC_STATUS.SAVED:
        return t('generalLayout.manualSync.savedTo', { documentStorage: DocumentStorage.DROPBOX });
      default:
        return t('generalLayout.manualSync.syncWith', { documentStorage: DocumentStorage.DROPBOX });
    }
  };

  return (
    <PlainTooltip content={getTooltipContent()}>
      <span>
        <Button
          disabled={shouldDisabled || isOffline || !isPdfFile}
          onClick={() => handleSyncThirdParty()}
          size="lg"
          variant="outlined"
          style={{
            minWidth: '98px',
          }}
        >
          <Styled.DropboxContent>{buttonContentMarkup()}</Styled.DropboxContent>
        </Button>
      </span>
    </PlainTooltip>
  );
};

export default DropboxSyncButton;
