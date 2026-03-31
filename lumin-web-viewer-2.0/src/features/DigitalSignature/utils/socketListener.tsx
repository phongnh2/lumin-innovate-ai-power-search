import { ArrowSquareOutIcon } from '@luminpdf/icons/dist/csr/ArrowSquareOut';
import { t } from 'i18next';
import { ModalTypes } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import { ModalName } from 'utils/Factory/EventCollection/constants/ModalName';
import modalEvent, { ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { bottomToastActions } from 'features/BottomToast/slice';

import { BANANA_SIGN_WEB_URL } from 'constants/urls';

import SuccessTitleModal from '../components/SuccessTitleModal';
import { digitalSignatureActions } from '../slices';

type Step = 'start_proofing' | 'upload_agreement' | 'apply_digital_signature' | 'finished' | 'failed';

export const onSyncProofingProgress = ({
  step,
  data,
}: {
  taskId: string;
  step: Step;
  progress: number;
  data: Record<string, unknown>;
}) => {
  const { dispatch } = store;

  const state = store.getState();
  const currentDocument = selectors.getCurrentDocument(state);
  const currentUser = selectors.getCurrentUser(state);
  if (!currentDocument || !currentUser) {
    return;
  }

  if (currentUser._id !== data.userId || currentDocument._id !== data.documentId) {
    return;
  }

  if (step === 'finished') {
    dispatch(bottomToastActions.setOpen(false));
    dispatch(digitalSignatureActions.setIsProcessing(false));
    dispatch(
      actions.openModal({
        title: <SuccessTitleModal />,
        message: t('viewer.bananaSign.successModalDescription'),
        confirmButtonTitle: t('viewer.bananaSign.showInSign'),
        cancelButtonTitle: t('common.notNow'),
        useReskinModal: true,
        onConfirm: () => {
          modalEvent.modalConfirmation({
            modalName: ModalName.CREATE_CERTIFIED_VERSION_SUCCESS,
            modalPurpose: ModalPurpose[ModalName.CREATE_CERTIFIED_VERSION_SUCCESS],
          }).catch(() => {});
          window.open(`${BANANA_SIGN_WEB_URL}/document/${data.contractId as string}`, '_blank');
        },
        onCancel: () => {
          modalEvent.modalDismiss({
            modalName: ModalName.CREATE_CERTIFIED_VERSION_SUCCESS,
            modalPurpose: ModalPurpose[ModalName.CREATE_CERTIFIED_VERSION_SUCCESS],
          }).catch(() => {});
        },
        cancelButtonProps: {
          variant: 'text',
        },
        confirmButtonProps: {
          startIcon: <ArrowSquareOutIcon size={24} />,
        },
      }) as AnyAction
    );
    modalEvent.modalViewed({
      modalName: ModalName.CREATE_CERTIFIED_VERSION_SUCCESS,
      modalPurpose: ModalPurpose[ModalName.CREATE_CERTIFIED_VERSION_SUCCESS],
    }).catch(() => {});
  }
  if (step === 'failed') {
    dispatch(bottomToastActions.setOpen(false));
    dispatch(digitalSignatureActions.setIsProcessing(false));
    dispatch(
      actions.openModal({
        type: ModalTypes.warning,
        message: t('viewer.bananaSign.createCertifiedVersionFailedDescription'),
        title: t('viewer.bananaSign.createCertifiedVersionFailedTitle'),
        confirmButtonTitle: t('common.gotIt'),
        useReskinModal: true,
        onConfirm: () => {
          modalEvent.modalConfirmation({
            modalName: ModalName.CREATE_CERTIFIED_VERSION_FAIL,
            modalPurpose: ModalPurpose[ModalName.CREATE_CERTIFIED_VERSION_FAIL],
          }).catch(() => {});
        },
      }) as AnyAction
    );
    modalEvent.modalViewed({
      modalName: ModalName.CREATE_CERTIFIED_VERSION_FAIL,
      modalPurpose: ModalPurpose[ModalName.CREATE_CERTIFIED_VERSION_FAIL],
    }).catch(() => {});
  }
};
