import { t } from 'i18next';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import { store } from 'src/redux/store';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import importWidgetAnnotations from 'helpers/importWidgetAnnotations';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getWidgetXfdf } from 'utils/formBuildUtils';

import { formBuilder } from 'features/DocumentFormBuild';
import { useFormFieldDetectionStore } from 'features/FormFieldDetection/hooks/useFormFieldDetectionStore';
import { resetFormFieldDetectionState } from 'features/FormFieldDetection/slice';

import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { ModalTypes } from 'constants/lumin-common';

const { dispatch, getState } = store;

let isAnnotationModified = false;

export const setAnnotationModified = (isModified) => {
  isAnnotationModified = isModified;
};

const exitGeneralLayoutFormBuild = () => {
  dispatch(resetFormFieldDetectionState());
  dispatch(actions.setIsToolPropertiesOpen(false));
  dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.DEFAULT));
};

const enterGeneralLayoutFormBuild = () => {
  dispatch(actions.closeLuminRightPanel());
  dispatch(actions.setIsToolPropertiesOpen(true));
  dispatch(actions.setToolPropertiesValue(TOOL_PROPERTIES_VALUE.FORM_BUILD));
};

export const toggleFormFieldCreationMode = (
  dataElement,
  { forceClose = false, callback = () => {} } = {},
  { isFormFieldDetecting = false } = {}
) => {
  const formFieldCreationManager = core.getFormFieldCreationManager();
  if (dataElement === DataElements.FORM_BUILD_PANEL && !formFieldCreationManager.isInFormFieldCreationMode()) {
    dispatch(actions.openElement(DataElements.FORM_BUILD_TOOLTIP));
    getWidgetXfdf().then((xfdf) => {
      dispatch(actions.setInitialWidgetXfdf(xfdf));
      formFieldCreationManager.startFormFieldCreationMode();
      const currentFields = core.getAnnotationManager().getFieldManager().getFields();
      formBuilder.setCurrentFields(currentFields);
      core.setToolMode(defaultTool);
      enterGeneralLayoutFormBuild();
    });
    return true;
  }
  if (formFieldCreationManager.isInFormFieldCreationMode()) {
    if (isFormFieldDetecting) {
      return true;
    }

    const onCancel = async () => {
      const state = getState();
      const initialWidgetXfdf = selectors.getInitialWidgetXfdf(state);
      formBuilder.reset();
      core.getAnnotationManager().addEventListener(
        'annotationsDrawn',
        async () => {
          await importWidgetAnnotations(initialWidgetXfdf);
        },
        {
          once: true,
        }
      );
      formFieldCreationManager.isDiscardChange = true;
      formFieldCreationManager.endFormFieldCreationMode();
      exitGeneralLayoutFormBuild();
      setAnnotationModified(false);
      core.setToolMode(defaultTool);
      callback();
      useFormFieldDetectionStore.getState().removeAllData();
    };
    const onConfirm = () => {};

    if (!forceClose && isAnnotationModified) {
      // eslint-disable-next-line no-use-before-define
      promptBeforeLeave(onCancel, onConfirm);
      return true;
    }
    formFieldCreationManager.endFormFieldCreationMode();
    exitGeneralLayoutFormBuild();
    return false;
  }
};

const promptBeforeLeave = (onCancel, onConfirm) => {
  const modalData = {
    title: t('viewer.formBuildPanel.leavingFormBuildMode'),
    message: t('viewer.formBuildPanel.notSaveChanges'),
    type: ModalTypes.WARNING,
    confirmButtonTitle: t('action.stay'),
    cancelButtonTitle: t('action.discardChanges'),
    onCancel,
    onConfirm,
    cancelDataLumin: {
      'data-lumin-btn-name': ButtonName.FORM_BUILDER_DISCARD_CHANGES,
      'data-lumin-btn-purpose': ButtonPurpose[ButtonName.FORM_BUILDER_DISCARD_CHANGES],
    },
    confirmDataLumin: {
      'data-lumin-btn-name': ButtonName.FORM_BUILDER_CANCEL_DISCARD_CHANGES,
      'data-lumin-btn-purpose': ButtonPurpose[ButtonName.FORM_BUILDER_CANCEL_DISCARD_CHANGES],
    },
  };

  dispatch(actions.openViewerModal(modalData));
};

export const withExitFormBuildChecking =
  (callback = (f) => f) =>
  (...params) => {
    const shouldBlockNextAction = toggleFormFieldCreationMode();
    if (shouldBlockNextAction) {
      return (f) => f;
    }

    callback(...params);
  };
