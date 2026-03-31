import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';

import actions from 'actions';
import core from 'core';

import { saveLocalFile } from 'lumin-components/ViewerCommon/LocalSave/helper/saveLocalFile';

import logger from 'helpers/logger';
import verifyDocumentDigitalSigned from 'helpers/verifyDocumentDigitalSigned';

import { exitEditPdfMode } from 'utils/editPDF';
import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';
import { waitForEditBoxAvailable, startContentEditMode } from 'utils/setupEditBoxesListener';

import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { ModalTypes } from 'constants/lumin-common';

export const openWarningEditTextModal = async (props) => {
  const {
    dispatch,
    t,
    setToolbarValue,
    setIsToolPropertiesOpen,
    currentDocument,
    enterEditPdfTool,
    handleClickViewerButton,
    closeEditMode,
  } = props;

  const changeMode = (newToolName) => {
    core.deselectAllAnnotations();
    core.setToolMode(newToolName);
    dispatch(actions.closeElement('toolStylePopup', 'searchOverlay', 'viewControlsOverlay'));
  };

  const listenEditBoxesAvailable = () => {
    waitForEditBoxAvailable(
      () => {
        dispatch(actions.closeElement(DataElements.LOADING_MODAL));
      },
      { once: true }
    );
  };

  const modalEventData = {
    modalName: ModalName.OPEN_EDIT_PDF_MODE,
    modalPurpose: ModalPurpose[ModalName.OPEN_EDIT_PDF_MODE],
  };

  closeEditMode();
  handleClickViewerButton();
  dispatch(actions.openElement(DataElements.LOADING_MODAL));
  const isDocumentDigitalSigned = await verifyDocumentDigitalSigned();
  if (isDocumentDigitalSigned) {
    showDocumentDigitallySignedModal(dispatch, t, setToolbarValue);
    return;
  }
  listenEditBoxesAvailable();
  startContentEditMode();
  core.setToolMode(defaultTool);
  core.deselectAllAnnotations();
  setToolbarValue(LEFT_SIDE_BAR_VALUES.EDIT_PDF.value);
  enterEditPdfTool();
  setIsToolPropertiesOpen(true);
  dispatch(actions.setDiscardContentEdit(false));
  dispatch(actions.setIsInContentEditMode(true));
  dispatch(actions.openElement(DataElements.LOADING_MODAL));
  dispatch(actions.closeLuminRightPanel());
  if (!currentDocument.isSystemFile) {
    modalEvent.modalConfirmation(modalEventData);
    return;
  }
  try {
    await saveLocalFile();
    modalEvent.modalConfirmation(modalEventData);
  } catch (e) {
    logger.logError({
      reason: 'Cannot Save Local File',
      error: e,
    });
    changeMode(defaultTool);
    modalEvent.modalDismiss(modalEventData);
  }
};

function showDocumentDigitallySignedModal(dispatch, t, setToolbarValue) {
  dispatch(actions.closeElement(DataElements.LOADING_MODAL));
  dispatch(
    actions.openViewerModal({
      message: t('viewer.documentDigitallySignedModal.message'),
      title: t('viewer.documentDigitallySignedModal.title'),
      confirmButtonTitle: t('action.ok'),
      type: ModalTypes.INFO,
      onCancel: undefined,
      onConfirm: () => {
        setToolbarValue(LEFT_SIDE_BAR_VALUES.POPULAR.value);
        exitEditPdfMode();
      },
    })
  );
}
