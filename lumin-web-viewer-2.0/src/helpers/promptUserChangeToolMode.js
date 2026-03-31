import i18next from 'i18next';
import React from 'react';

import { LayoutElements } from '@new-ui/constants';
import { setBackDropMessage } from 'actions/customActions';
import { store } from 'src/redux/store';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { onConfirmSaveEditedText, onCancelSaveEditText } from 'utils/editPDF';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import { setIsAiProcessing, selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';
import toolCallingQueue from 'features/EditorChatBot/utils/toolCallingQueue';

import defaultTool from 'constants/defaultTool';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { ModalTypes } from 'constants/lumin-common';
import toolsName from 'constants/toolsName';

const { dispatch, getState } = store;

const promptUserChangeToolMode = ({
  toolName = '',
  callback = () => {},
  applyForTool = '',
  cancelCallback = () => {},
  forceReload = true,
  triggerWhenConfirm = () => {},
  triggerWhenCancel = () => {},
}) => {
  let currentTool = core.getToolMode().name;
  const state = getState();
  const isInContentEditMode = selectors.isInContentEditMode(state);
  if (isInContentEditMode) {
    currentTool = toolsName.CONTENT_EDIT;
  }
  // eslint-disable-next-line no-use-before-define
  const setting = mapTools()[currentTool];
  const shouldApplyForAllTool = Boolean(!applyForTool);
  if (!setting) {
    toolName && core.setToolMode(toolName);
    return false;
  }

  const { checkConditionCallback, onCancel, onConfirm, invertCallbackOrder, modalEventData, ...modalSetting } = setting;
  const shouldPromptUser = checkConditionCallback() && (shouldApplyForAllTool || applyForTool === currentTool);
  if (localStorage.getItem(`notShowPrompExitMode${currentTool}`)) {
    onCancel();
    toolName && core.setToolMode(toolName);
    return false;
  }

  const onChangeMode = async (isChecked) => {
    if (isChecked) {
      localStorage.setItem(`notShowPrompExitMode${currentTool}`, true);
      modalEvent.modalHidden(modalEventData);
    }
    triggerWhenConfirm();
    await onConfirm();
    toolName && core.setToolMode(toolName);
    callback();
    modalEvent.modalConfirmation(modalEventData);
  };

  const onContinue = async ({ isChecked }) => {
    if (isChecked) {
      localStorage.setItem(`notShowPrompExitMode${currentTool}`, true);
      modalEvent.modalHidden(modalEventData);
    }
    if (!setting.hasCloseBtn) {
      modalEvent.modalDismiss(modalEventData);
    }
    triggerWhenCancel();
    await onCancel({ forceReload });
    cancelCallback();
  };

  const [handleCancel, handleConfirm] = invertCallbackOrder ? [onChangeMode, onContinue] : [onContinue, onChangeMode];
  if (shouldPromptUser) {
    // eslint-disable-next-line no-use-before-define
    promptBeforeChange({
      onCancel: handleCancel,
      onConfirm: handleConfirm,
      modalSetting,
    });
    modalEvent.modalViewed(modalEventData);
    return true;
  }
  return false;
};

const promptBeforeChange = ({ onCancel, onConfirm, modalSetting }) => {
  const modalData = {
    ...modalSetting,
    onCancel,
    onConfirm,
    type: ModalTypes.WARNING,
  };
  dispatch(actions.openViewerModal(modalData));
};

export const mapTools = () => {
  const state = getState();
  const isAiProcessing = editorChatBotSelectors.getIsAiProcessing(state);
  return {
    [toolsName.REDACTION]: {
      checkConditionCallback: () =>
        core.getAnnotationsList().some((annot) => annot.Subject === AnnotationSubjectMapping.redact),
      title: i18next.t('modal.leavingRedactionMode'),
      message: i18next.t('modal.changesWillNotBeSaved'),
      confirmButtonTitle: i18next.t('action.stay'),
      cancelButtonTitle: i18next.t('action.discardChanges'),
      checkboxMessage: i18next.t('modal.doNotAskMeAgain'),
      invertCallbackOrder: true,
      onCancel: () => {},
      onConfirm: () => {
        core.setToolMode(defaultTool);
      },
      modalEventData: {
        modalName: ModalName.LEAVING_REDACTION_MODE,
        modalPurpose: ModalPurpose[ModalName.LEAVING_REDACTION_MODE],
      },
    },
    [toolsName.CONTENT_EDIT]: {
      checkConditionCallback: () => {
        if (core.getContentEditManager().isInContentEditMode()) {
          core.deselectAllAnnotations();
          return true;
        }
        return false;
      },
      title: i18next.t('modal.leavingEditMode'),
      message: <p>{i18next.t('modal.savedYourEdit')}</p>,
      confirmButtonTitle: i18next.t('action.save'),
      cancelButtonTitle: i18next.t('action.discardChanges'),
      invertCallbackOrder: false,
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      isCustomModal: false,
      closeOnConfirm: false,
      hasCloseBtn: true,
      cancelDataLumin: {
        'data-lumin-btn-name': ButtonName.DISCARD_CHANGES_EDIT_PDF,
      },
      confirmButtonProps: {
        disabled: isAiProcessing,
      },
      onCancel: () => {
        onCancelSaveEditText();
        dispatch(actions.closeModal());
        if (selectors.rightPanelValue(state) === LayoutElements.CHATBOT) {
          dispatch(setIsAiProcessing(false));
          toolCallingQueue.clearQueue('editText');
          dispatch(setBackDropMessage(null));
        }
      },
      onConfirm: async () => {
        dispatch(actions.updateModalProperties({ isProcessing: true }));
        await onConfirmSaveEditedText({
          asyncStorageSync: false,
        });
        if (selectors.rightPanelValue(state) === LayoutElements.CHATBOT) {
          dispatch(setIsAiProcessing(false));
          dispatch(setBackDropMessage(null));
        }
        dispatch(actions.closeModal());
      },
      modalEventData: {
        modalName: ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES,
        modalPurpose: ModalPurpose[ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES],
      },
      onClose: (isCloseBtn = false) => {
        isCloseBtn &&
          modalEvent.modalDismiss({
            modalName: ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES,
            modalPurpose: ModalPurpose[ModalName.LEAVE_EDIT_MODE_AND_SAVE_CHANGES],
          });
      },
    },
  };
};

export const handlePromptCallback =
  (params) =>
  (...param) => {
    const { callback, applyForTool = '', forceReload = true, cancelCallback = () => {} } = params || {};
    const shouldStopEvent = promptUserChangeToolMode({
      callback: () => callback(...param),
      applyForTool,
      forceReload,
      cancelCallback,
    });
    if (shouldStopEvent) {
      return;
    }
    callback(...param);
  };

export default promptUserChangeToolMode;
