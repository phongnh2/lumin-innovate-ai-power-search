/* eslint-disable @typescript-eslint/no-floating-promises */
import React from 'react';
import { useDispatch, batch } from 'react-redux';
import { AnyAction } from 'redux';

import actions from 'actions';

import WarningOCRContent from 'lumin-components/WarningOCRContent';

import { useTranslation } from 'hooks/useTranslation';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { DataElements } from 'constants/dataElement';
import { ModalTypes } from 'constants/lumin-common';

import { onCheckboxValue } from './utils';

const useShowModal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const showUnavailableModal = () => {
    const modalEventData = {
      modalName: ModalName.OCR_UNAVAILABLE,
      modalPurpose: ModalPurpose[ModalName.OCR_UNAVAILABLE],
    };
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.ERROR,
        title: t('viewer.ocr.unavailableTitle'),
        message: t('viewer.ocr.unavailableDescription'),
        confirmButtonTitle: t('common.gotIt'),
        cancelButtonTitle: '',
        footerVariant: 'variant2',
        // eslint-disable-next-line @typescript-eslint/require-await
        onConfirm: async () => {
          modalEvent.modalConfirmation(modalEventData);
          dispatch(actions.closeModal() as AnyAction);
        },
      }) as AnyAction
    );
    modalEvent.modalViewed(modalEventData);
  };

  const showPromptModal = (processOCR: () => Promise<void>) => {
    const modalEventData = {
      modalName: ModalName.CONFIRM_PERFORMING_OCR,
      modalPurpose: ModalPurpose[ModalName.CONFIRM_PERFORMING_OCR],
    };
    dispatch(
      actions.openViewerModal({
        type: ModalTypes.WARNING,
        title: t('viewer.ocr.performing'),
        message: React.createElement(WarningOCRContent),
        confirmButtonTitle: t('common.confirm'),
        cancelButtonTitle: t('common.cancel'),
        footerVariant: 'variant3',
        onCancel: (checkboxValue: boolean): void => {
          onCheckboxValue(checkboxValue, modalEventData);
          modalEvent.modalDismiss(modalEventData);
        },
        onConfirm: async (checkboxValue: boolean): Promise<void> => {
          onCheckboxValue(checkboxValue, modalEventData);
          modalEvent.modalConfirmation(modalEventData);
          dispatch(actions.closeModal() as AnyAction);
          await processOCR();
        },
        checkboxMessage: t('modalWarningFormBuilder.doNotShowAgain'),
        checkboxWrapperClassname: 'form-field-checkbox-wrapper',
      }) as AnyAction
    );
    modalEvent.modalViewed(modalEventData);
  };

  const openLoadingModal = (totalPages: number) => {
    batch(() => {
      dispatch(actions.openElement(DataElements.VIEWER_LOADING_MODAL) as AnyAction);
      dispatch(
        actions.setupViewerLoadingModal({
          totalSteps: totalPages,
          renderStatus: () => `${t('viewer.ocr.performing')}...`,
          progressSuffix: t('viewer.ocr.pageCount', { count: totalPages }),
          size: 'small',
          circularSize: 104,
        }) as AnyAction
      );
    });
  };

  return {
    showUnavailableModal,
    showPromptModal,
    openLoadingModal,
  };
};

export default useShowModal;
