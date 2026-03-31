import { AnyAction } from 'redux';

import { enqueueSnackbar } from '@libs/snackbar';

import actions from 'actions';
import { store } from 'store';

import documentServices from 'services/documentServices';
import { socketService } from 'services/socketServices';

import { DataElements } from 'constants/dataElement';

import { IDocumentBase } from 'interfaces/document/document.interface';

const handleSyncFileLuminStorage = async (
  currentDocument: IDocumentBase,
  translator: (key: string) => string
): Promise<void> => {
  const { dispatch } = store;
  try {
    dispatch(actions.openElement(DataElements.LOADING_MODAL) as AnyAction);
    socketService.modifyDocumentContent(currentDocument._id, { status: 'preparing', increaseVersion: true });
    await documentServices.syncFileToS3Exclusive(currentDocument, { increaseVersion: true });
    const syncFileSuccessToast = {
      message: translator('viewer.documentIsUpdated'),
    };
    enqueueSnackbar({
      message: syncFileSuccessToast.message,
      variant: 'success',
    });
  } catch (error) {
    const syncFileErrorToast = {
      message: translator('viewer.errorSync'),
    };
    socketService.modifyDocumentContent(currentDocument._id, { status: 'failed', increaseVersion: true });
    enqueueSnackbar({
      message: syncFileErrorToast.message,
      variant: 'error',
    });
  } finally {
    dispatch(actions.closeElement(DataElements.LOADING_MODAL) as AnyAction);
  }
};

export default handleSyncFileLuminStorage;
