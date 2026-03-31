import { t } from 'i18next';
import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import { DataElements } from 'constants/dataElement';
import { ModalTypes } from 'constants/lumin-common';

import { exitEditPdfMode } from './editPDF';

const { dispatch } = store;

export const showDigitalSignatureModal = () => {
  dispatch(actions.closeElement(DataElements.LOADING_MODAL) as AnyAction);
  dispatch(
    actions.openViewerModal({
      message: t('viewer.documentDigitallySignedModal.message'),
      title: t('viewer.documentDigitallySignedModal.title'),
      confirmButtonTitle: t('action.ok'),
      type: ModalTypes.INFO,
      onCancel: undefined,
      onConfirm: () => {
        exitEditPdfMode();
      },
    }) as AnyAction
  );
};
