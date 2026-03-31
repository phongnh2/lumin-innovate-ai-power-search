/* eslint-disable arrow-body-style */
import { Button, PlainTooltip } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { connect, useSelector } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';
import CircularProgress from '@new-ui/general-components/CircularProgress';

import selectors from 'selectors';

import Icomoon from 'luminComponents/Icomoon';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation, useAutoSync } from 'hooks';
import useDocumentTools from 'hooks/useDocumentTools';

import { readAloudSelectors } from 'features/ReadAloud/slices';

import { AUTO_SYNC_ERROR, AUTO_SYNC_STATUS } from 'constants/autoSyncConstant';
import { DocumentStorage } from 'constants/documentConstants';
import { general } from 'constants/documentType';
import { STORAGE_TYPE } from 'constants/lumin-common';

import * as Styled from './ManualSyncBtn.styled';

const ManualSyncBtn = ({ autoSyncStatus, currentDocument, canModifyDriveContent }) => {
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const isPdfFile = currentDocument.mimeType === general.PDF;
  const disabled = autoSyncStatus === AUTO_SYNC_STATUS.SYNCING || !isPdfFile || isInReadAloudMode;
  const { t } = useTranslation();
  const { handleDocStackForSyncExternalFile } = useDocumentTools();
  const { sync, showErrorModal } = useAutoSync({
    onSyncSuccess: ({ hasBackupToS3: syncToS3 }) => {
      if (!syncToS3) {
        enqueueSnackbar({
          message: t('viewer.header.yourFileHasBeenSyncedTo', { destinationStorage: DocumentStorage.GOOGLE }),
          variant: 'success',
          preventDuplicate: true,
        });
      }
    },
  });

  const renderContent = () => {
    switch (autoSyncStatus) {
      case AUTO_SYNC_STATUS.SYNCING:
        return (
          <>
            <CircularProgress size={24} variant="indeterminate" />
            <span>{t('viewer.header.sync')}</span>
          </>
        );
      case AUTO_SYNC_STATUS.SAVED:
        return (
          <>
            <Icomoon className="md_cloud_check" size={24} />
            <span>{t('generalLayout.manualSync.synced')}</span>
          </>
        );
      default:
        return (
          <>
            <SvgElement content="icon-googledrive" width={24} height={24} />
            <span>{t('viewer.header.sync')}</span>
          </>
        );
    }
  };

  const getTooltipContent = () => {
    if (!isPdfFile) {
      return t('generalLayout.manualSync.fileTypeUnsupported', { documentStorage: DocumentStorage.GOOGLE });
    }
    switch (autoSyncStatus) {
      case AUTO_SYNC_STATUS.SYNCING:
        return t('action.syncingInProgress');
      case AUTO_SYNC_STATUS.SAVED:
        return t('generalLayout.manualSync.savedTo', { documentStorage: DocumentStorage.GOOGLE });
      default:
        return t('generalLayout.manualSync.syncWith', { documentStorage: DocumentStorage.GOOGLE });
    }
  };

  const onClick = async () => {
    if (canModifyDriveContent) {
      handleDocStackForSyncExternalFile({
        callback: sync,
        storage: STORAGE_TYPE.GOOGLE,
      });
    } else {
      showErrorModal({ reason: AUTO_SYNC_ERROR.NO_PERMISSION });
    }
  };

  return (
    <PlainTooltip content={getTooltipContent()}>
      <span>
        <Button variant="outlined" size="lg" onClick={onClick} disabled={disabled}>
          <Styled.ContentWrapper>{renderContent()}</Styled.ContentWrapper>
        </Button>
      </span>
    </PlainTooltip>
  );
};

ManualSyncBtn.propTypes = {
  currentDocument: PropTypes.object.isRequired,
  autoSyncStatus: PropTypes.oneOf(['', ...Object.values(AUTO_SYNC_STATUS)]),
  canModifyDriveContent: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  autoSyncStatus: selectors.getAutoSyncStatus(state),
  currentDocument: selectors.getCurrentDocument(state),
  canModifyDriveContent: selectors.canModifyDriveContent(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ManualSyncBtn);
