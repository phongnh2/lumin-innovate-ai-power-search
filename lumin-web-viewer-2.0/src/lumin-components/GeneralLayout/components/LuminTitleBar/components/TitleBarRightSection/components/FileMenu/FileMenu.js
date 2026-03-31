import { camelCase } from 'lodash';
import { Menu } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import { enqueueSnackbar } from '@libs/snackbar';
import IconButton from '@new-ui/general-components/IconButton';

import actions from 'actions';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { isIE } from 'helpers/device';
import exportAnnotations from 'helpers/exportAnnotations';
import logger from 'helpers/logger';

import { eventTracking, file as fileUtils, getFileService } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import documentEvent from 'utils/Factory/EventCollection/DocumentEventCollection';

import { COMPRESS_RESOLUTION, COMPRESS_TIMEOUT_ERROR } from 'features/CompressPdf/constants';
import { useProcessingCompressPdf } from 'features/CompressPdf/hooks/useProcessingCompressPdf';
import { compressPdfSelectors } from 'features/CompressPdf/slices';
import CopyToThirdPartyStorageModal from 'features/CopyDocumentModal/components/CopyToThirdPartyStorageModal';
import {
  copyDocumentModalSelectors,
  setSyncFileDestination,
  openCopyToDriveModal,
  closeCopyToDriveModal
} from 'features/CopyDocumentModal/slice';
import useSyncFileToExternalStorage from 'features/DocumentUploadExternal/useSyncFileToExternalStorage';
import { openMoveDocumentModal } from 'features/MoveDocumentModal';

import { AnimationBanner } from 'constants/banner';
import { StepPercentage } from 'constants/customConstant';
import { DataElements } from 'constants/dataElement';
import { general } from 'constants/documentType';
import UserEventConstants from 'constants/eventConstants';
import { LOGGER, ModalTypes, STORAGE_TYPE, STORAGE_TYPE_DESC } from 'constants/lumin-common';
import { ERROR_TIMEOUT_MESSAGE } from 'constants/messages';
import { supportedExtensionsWhenMakeCopyToDrive } from 'constants/supportedFiles';

import MoveDocumentProvider from './MoveDocumentProvider';
import PopoverContent from './PopoverContent';

import styles from './FileMenu.module.scss';

const FileMenu = (props) => {
  const {
    document: currentDocument,
    downloadType,
    isOpenSaveToDrive = false,
    openElement,
    closeElement,
    setupViewerLoadingModal,
    resetViewerLoadingModal,
    menuItemKey = null,
  } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isOpenCopyToDriveModal = useSelector(copyDocumentModalSelectors.isOpenCopyToDriveModal);
  const syncFileTo = useSelector(copyDocumentModalSelectors.syncFileTo);

  const filenameWithoutExtension = fileUtils.getFilenameWithoutExtension(currentDocument.name);
  const [documentName, setDocumentName] = useState(filenameWithoutExtension);

  const handleSyncFile = useSyncFileToExternalStorage(syncFileTo);

  const compressPdfLevel = useSelector(compressPdfSelectors.getCompressLevel);
  const { compressPdfCallback } = useProcessingCompressPdf({ compressLevel: compressPdfLevel });
  const flattenPdf = useSelector(selectors.isFlattenPdf);

  useEffect(() => {
    setDocumentName(fileUtils.getFilenameWithoutExtension(currentDocument.name));
  }, [currentDocument.name]);

  const onCloseCopyToDriveModal = useCallback(() => {
    dispatch(closeCopyToDriveModal());
    closeElement(DataElements.SAVE_TO_DRIVE);
  }, []);

  const getStatus = (_, progress) => {
    if (progress >= 0 && progress <= StepPercentage.InitializeJob) {
      return t('viewer.downloadModal.creatingJob');
    }
    if (progress > StepPercentage.InitializeJob && progress < StepPercentage.ProcessingFile) {
      return t('viewer.downloadModal.processingFile');
    }
    return t('viewer.downloadModal.saving');
  };

  const getDestination = ({ documentLocation, destinationStorage }) => {
    if (!documentLocation) {
      return destinationStorage;
    }
    return (
      <a href={documentLocation} target="_blank" rel="noreferrer" className={styles.link}>
        {destinationStorage}
      </a>
    );
  };

  const getCompressFileBuffer = async () =>
    exportAnnotations()
      .then(async (xfdfString) => ({
        fileBuffer: await getFileService.getFileDataByPDFNet({ xfdf: xfdfString }),
        mimeType: general.PDF,
      }))
      .catch((error) => {
        logger.logError({ error, reason: LOGGER.Service.DOWNLOAD_DOCUMENT_ERROR });
        closeElement(DataElements.SAVE_TO_DRIVE);
        closeElement(DataElements.VIEWER_LOADING_MODAL);
      });

  const createFileForCompress = ({ fileBuffer, fileName, mimeType }) =>
    isIE ? new Blob([fileBuffer], { type: mimeType }) : new File([fileBuffer], fileName, { type: mimeType });

  const duplicateFileToStorage = async (newDocumentName, folderInfo = {}) => {
    openElement(DataElements.VIEWER_LOADING_MODAL);
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: ButtonName.CONFIRM_SAVE_TO_DRIVE,
      elementPurpose: ButtonPurpose[ButtonName.CONFIRM_SAVE_TO_DRIVE],
    }).catch(() => {});
    setupViewerLoadingModal({
      totalSteps: 100,
      renderStatus: getStatus,
      isShowPercentage: true,
      circularSize: 108,
      variant: 'download',
    });
    dispatch(closeCopyToDriveModal());

    let fileToSync = null;
    const isCompressingPdf = compressPdfLevel !== COMPRESS_RESOLUTION.NONE;

    if (isCompressingPdf) {
      const { fileBuffer, mimeType } = await getCompressFileBuffer();
      const file = createFileForCompress({ fileBuffer, fileName: currentDocument.name, mimeType });
      const fileUrl = URL.createObjectURL(file);
      try {
        const compressedFile = await compressPdfCallback({ fileUrl });
        const isCompressedSmaller = compressedFile.size < currentDocument.size;
        if (isCompressedSmaller) {
          fileToSync = compressedFile;
        }
      } catch (error) {
        dispatch(actions.closeElement(DataElements.VIEWER_LOADING_MODAL));
        dispatch(actions.resetViewerLoadingModal());
        if (error?.message === COMPRESS_TIMEOUT_ERROR) {
          dispatch(
            actions.openViewerModal({
              type: ModalTypes.ERROR,
              title: t(ERROR_TIMEOUT_MESSAGE.REQUEST_TIMEOUT),
              message: t(ERROR_TIMEOUT_MESSAGE.CHECK_CONNECTION),
              confirmButtonTitle: t('common.gotIt'),
              isFullWidthButton: true,
              disableBackdropClick: true,
              cancelButtonTitle: '',
              onConfirm: () => {
                dispatch(actions.closeModal());
              },
            })
          );
        }
        return;
      }
    }

    const { destinationStorage, documentLocation, successMsg } = await handleSyncFile({
      isOverride: false,
      currentDocument,
      newDocumentName: isCompressingPdf ? `${newDocumentName}_compressed` : newDocumentName,
      folderInfo,
      downloadType,
      file: fileToSync,
      flattenPdf,
    });

    if (successMsg) {
      enqueueSnackbar({
        message: (
          <>
            {successMsg} {getDestination({ destinationStorage, documentLocation })}
          </>
        ),
        variant: 'success',
      });
      let fileType = 'pdf';
      if (
        destinationStorage === STORAGE_TYPE_DESC[STORAGE_TYPE.GOOGLE] &&
        supportedExtensionsWhenMakeCopyToDrive.includes(downloadType)
      ) {
        fileType = downloadType;
      }
      dispatch(actions.setFlattenPdf(false));
      documentEvent.downloadDocumentSuccess({ fileType, savedLocation: camelCase(destinationStorage), flattenPdf });
    }
    closeElement(DataElements.SAVE_TO_DRIVE);
    closeElement(DataElements.VIEWER_LOADING_MODAL);
    resetViewerLoadingModal();
    dispatch(actions.setShouldShowRating(AnimationBanner.SHOW));
  };

  useEffect(() => {
    if (isOpenSaveToDrive) {
      dispatch(openCopyToDriveModal());
      dispatch(setSyncFileDestination(STORAGE_TYPE.GOOGLE));
    }
  }, [dispatch, isOpenSaveToDrive]);

  const renderPopoverContent = ({ disabledMoveDocument }) => (
    <PopoverContent
      openMoveDocumentModal={() => dispatch(openMoveDocumentModal([currentDocument]))}
      disabledMoveDocument={disabledMoveDocument}
      menuItemKey={menuItemKey}
    />
  );

  if (menuItemKey) {
    return (
      <MoveDocumentProvider>
        {({ disabled: disabledMoveDocument }) => renderPopoverContent({ disabledMoveDocument })}
      </MoveDocumentProvider>
    );
  }

  return (
    <MoveDocumentProvider>
      {({ disabled: disabledMoveDocument }) => (
        <>
          {isOpenCopyToDriveModal && (
            <CopyToThirdPartyStorageModal
              key={isOpenSaveToDrive ? 'openSaveDocModal' : 'openCopyDocModal'}
              isOpen={isOpenCopyToDriveModal}
              onClose={onCloseCopyToDriveModal}
              currentDocumentName={documentName}
              destinationStorage={STORAGE_TYPE_DESC[syncFileTo]}
              onConfirm={duplicateFileToStorage}
              downloadType={isOpenSaveToDrive ? downloadType : undefined}
              action={isOpenSaveToDrive ? UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD : undefined}
            />
          )}
          <Menu
            data-cy="file-menu"
            ComponentTarget={
              <IconButton
                icon="md_more_horizontal_menu"
                size="large"
                iconSize={24}
                data-lumin-btn-name={UserEventConstants.Events.HeaderButtonsEvent.IN_VIEWER_MENU}
              />
            }
            itemSize="dense"
            classNames={{
              dropdown: styles.fileMenuDropdown,
            }}
          >
            {renderPopoverContent({ disabledMoveDocument })}
          </Menu>
        </>
      )}
    </MoveDocumentProvider>
  );
};

FileMenu.propTypes = {
  document: PropTypes.object.isRequired,
  downloadType: PropTypes.string.isRequired,
  isOpenSaveToDrive: PropTypes.bool,
  openElement: PropTypes.func.isRequired,
  closeElement: PropTypes.func.isRequired,
  setupViewerLoadingModal: PropTypes.func.isRequired,
  resetViewerLoadingModal: PropTypes.func.isRequired,
  menuItemKey: PropTypes.string,
};
const mapStateToProps = (state) => ({
  document: selectors.getCurrentDocument(state),
  downloadType: selectors.getDownloadType(state),
  isOpenSaveToDrive: selectors.isElementOpen(state, DataElements.SAVE_TO_DRIVE),
});

const mapDispatchToProps = (dispatch) => ({
  openViewerModal: (modalSettings) => dispatch(actions.openViewerModal(modalSettings)),
  setDocumentNotFound: () => dispatch(actions.setDocumentNotFound()),
  openElement: (element) => dispatch(actions.openElement(element)),
  closeElement: (dataElement) => dispatch(actions.closeElement(dataElement)),
  setupViewerLoadingModal: (args) => dispatch(actions.setupViewerLoadingModal(args)),
  resetViewerLoadingModal: () => dispatch(actions.resetViewerLoadingModal()),
});

export default connect(mapStateToProps, mapDispatchToProps)(FileMenu);
