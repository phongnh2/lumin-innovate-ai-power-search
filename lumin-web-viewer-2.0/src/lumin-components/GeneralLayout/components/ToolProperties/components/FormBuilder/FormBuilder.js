/* eslint-disable react/jsx-no-constructed-context-values */
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useShallow } from 'zustand/react/shallow';

import useToolProperties from '@new-ui/hooks/useToolProperties';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useIsSystemFile } from 'hooks/useIsSystemFile';
import { useLatestRef } from 'hooks/useLatestRef';
import { useOnFormFieldAnnotationAddedOrSelected } from 'hooks/useOnFormFieldAnnotationAddedOrSelected';
import { useSaveOperation } from 'hooks/useSaveOperation';

import { hideNonWidgetAnnotations } from 'helpers/hideNonWidgetAnnotations';
import { setAnnotationModified } from 'helpers/toggleFormFieldCreationMode';

import { eventTracking } from 'utils/recordUtil';

import { formBuilder } from 'features/DocumentFormBuild';
import { useBackupAnnotations } from 'features/DocumentRevision/hooks/useBackupAnnotations';
import { useEnabledRevision } from 'features/DocumentRevision/hooks/useEnabledRevision';
import { increaseExploredFeatureUsage } from 'features/EnableToolFromQueryParams/apis/increaseExploredFeatureUsage';
import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { ExploredFeatureKeys } from 'features/EnableToolFromQueryParams/constants/exploredFeatureKeys';
import { useCheckExploringFeature } from 'features/EnableToolFromQueryParams/hooks/useExploringFeature';
import { TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER } from 'features/FormFieldDetection/constants/mapper';
import { useFormFieldDetectionStore } from 'features/FormFieldDetection/hooks/useFormFieldDetectionStore';
import { useProcessAppliedFormFields } from 'features/FormFieldDetection/hooks/useProcessAppliedFormFields';
import { setIsApplyingFormFieldDetection } from 'features/FormFieldDetection/slice';
import { useFeedbackFormDisplay } from 'features/MultistepFeedbackForm/hooks';
import { openFeedbackForm } from 'features/MultistepFeedbackForm/slice';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { DataElements } from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { ANNOTATION_ACTION, ANNOTATION_STYLE, AnnotationSubjectMapping } from 'constants/documentConstants';
import UserEventConstants from 'constants/eventConstants';
import {
  ANNOTATION_DRAWN_DEBOUNCE_TIME,
  FORM_FIELD_TYPE,
  AI_AUTO_ADDED,
  SIZE_AND_POSITION,
  NEW_FORM_FIELD_IN_SESSION,
  FIELD_SESSION_ID,
} from 'constants/formBuildTool';
import { SAVE_OPERATION_STATUS, SAVE_OPERATION_TYPES } from 'constants/saveOperationConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import FormBuilderFooter from './components/Footer';
import FormBuilderHeader from './components/Header';
import FormBuilderMainContent from './components/MainContent';
import FormBuilderContext from './formBuilderContext';
import { FormFieldDimensionContext } from './FormFieldDimensionContext';
import { handleAddAssociatedField } from './utils';

import * as Styled from './FormBuilder.styled';

const { FORM_BUILD_PANEL, COMMENT_HISTORY_PANEL, TEXT_POPUP, CONTEXT_MENU_POPUP } = DataElements;

const MAP_TOOL_NAME_TO_TAB = {
  [TOOLS_NAME.CHECK_BOX]: FORM_FIELD_TYPE.CHECKBOX,
  [TOOLS_NAME.RADIO]: FORM_FIELD_TYPE.RADIO,
  [TOOLS_NAME.TEXT_FIELD]: FORM_FIELD_TYPE.TEXT,
  [TOOLS_NAME.SIGNATURE_FIELD]: FORM_FIELD_TYPE.SIGNATURE,
  [TOOLS_NAME.EDIT]: '',
};

const FormBuilder = () => {
  const { currentSessionId } = useFormFieldDetectionStore(
    useShallow((state) => ({
      currentSessionId: state.currentSessionId,
    }))
  );
  const { formFieldAnnotation, resetAnnotation } = useOnFormFieldAnnotationAddedOrSelected();
  const { closeToolPropertiesPanel } = useToolProperties();
  const { backupAnnotations } = useBackupAnnotations();
  const { isSystemFile } = useIsSystemFile();
  const { enabledForLuminStorage } = useEnabledRevision();
  const { startOperation, completeOperation } = useSaveOperation();
  const [{ width, height }, setDimension] = useState({
    width: 0,
    height: 0,
  });
  const isExploringFeature = useCheckExploringFeature({ pdfAction: PdfAction.FORM_BUILD });
  const currentDocument = useSelector(selectors.getCurrentDocument, shallowEqual);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const dispatch = useDispatch();
  const annotManager = core.getAnnotationManager();
  const formFieldCreationManager = core.getFormFieldCreationManager();

  const [tabValue, setTabValue] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [isReadOnly, setReadOnly] = useState(false);
  const [isMultiLine, setMultiLine] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [radioButtonGroups, setRadioButtonGroups] = useState([]);
  const [validationMessage, setValidationMessage] = useState('');
  const isFormFieldEnded = useRef(false);
  const currentSessionIdRef = useLatestRef(currentSessionId);
  const isInAutoDetectionModeRef = useRef(false);
  const { isFeedbackFormEligibleForDisplay, setLastFeedbackFormDisplayTime } = useFeedbackFormDisplay();
  const { handleProcessAppliedFormFields } = useProcessAppliedFormFields();

  const checkByDefaultMapping = useRef({});
  const oldName = useRef('');

  const handleEventTracking = (annotations, eventType) => {
    const eventData = annotations.reduce((acc, currentAnnot) => {
      const type = TOOLS_NAME_TO_EVENT_TRACKING_NAME_MAPPER[currentAnnot.ToolName];
      const isAiAutoAdded = currentAnnot.getCustomData(AI_AUTO_ADDED) === 'true';
      const updatedTypeData = {
        ...acc[type],
        ...(isAiAutoAdded
          ? { aiAutoAdded: (acc[type]?.aiAutoAdded || 0) + 1 }
          : { manual: (acc[type]?.manual || 0) + 1 }),
      };

      return {
        ...acc,
        [type]: updatedTypeData,
      };
    }, {});

    Object.entries(eventData).forEach(([key, value]) => {
      if (value.aiAutoAdded > 0) {
        eventTracking(eventType, { type: key, aiAutoAdded: true, total: value.aiAutoAdded });
      }

      if (value.manual > 0) {
        eventTracking(eventType, { type: key, aiAutoAdded: false, total: value.manual });
      }
    });
  };

  const redrawAnnotation = (annotation) => {
    annotManager.drawAnnotationsFromList([annotation]);
    setAnnotationModified(true);
  };

  const handleStyleChange = useCallback(
    (property, value) => {
      core.setAnnotationStyles(formFieldAnnotation, {
        [property]: value,
      });
      if (property === ANNOTATION_STYLE.STROKE_COLOR) {
        setIsValid(true);
      }
      if (property === ANNOTATION_STYLE.FONT) {
        formFieldAnnotation.font.set({
          name: value,
          type: 'TrueType',
        });
      }
    },
    [formFieldAnnotation]
  );

  useEffect(() => {
    const onFormFieldCreationModeStarted = async () => {
      annotManager.disableDraggingAcrossPages();

      setRadioButtonGroups(formFieldCreationManager.getRadioButtonGroups());
      dispatch(actions.disableElements([TEXT_POPUP, CONTEXT_MENU_POPUP]));
      dispatch(actions.openElement(FORM_BUILD_PANEL));
    };

    const closeAndReset = () => {
      core.setToolMode(defaultTool);
      dispatch(actions.openElement(COMMENT_HISTORY_PANEL));
      dispatch(actions.enableElements([TEXT_POPUP, CONTEXT_MENU_POPUP]));
      const annotations = core.getAnnotationsList();
      if (!annotations.filter((annot) => annot.Subject !== 'LUnique').length) {
        annotManager.trigger('annotationsDrawn');
      }

      setTabValue('');
      setIsValid(false);
      setAnnotationModified(false);
      core.deselectAllAnnotations();
    };

    const onFormFieldCreationModeEnded = async () => {
      annotManager.enableDraggingAcrossPages();
      isFormFieldEnded.current = true;
      closeAndReset();
    };

    formFieldCreationManager.addEventListener('formFieldCreationModeStarted', onFormFieldCreationModeStarted);
    formFieldCreationManager.addEventListener('formFieldCreationModeEnded', onFormFieldCreationModeEnded);

    return () => {
      formFieldCreationManager.removeEventListener('formFieldCreationModeStarted', onFormFieldCreationModeStarted);
      formFieldCreationManager.removeEventListener('formFieldCreationModeEnded', onFormFieldCreationModeEnded);
    };
  }, [annotManager, formFieldCreationManager, dispatch]);

  const handleModifyAction = (annotations) => {
    const resizedFieldList = [];
    const movedFieldList = [];

    annotations.forEach((annotation) => {
      const oldDataString = annotation.getCustomData(SIZE_AND_POSITION);
      if (!oldDataString) return;

      const prevData = JSON.parse(oldDataString);
      const newData = { ...prevData };

      // Check for resizing
      if (
        Math.round(prevData.height) !== Math.round(annotation.Height) ||
        Math.round(prevData.width) !== Math.round(annotation.Width)
      ) {
        resizedFieldList.push(annotation);
        newData.height = annotation.Height;
        newData.width = annotation.Width;
      }

      // Check for moving
      if (
        Math.round(prevData.x) !== Math.round(annotation.X) ||
        Math.round(prevData.y) !== Math.round(annotation.Y)
      ) {
        movedFieldList.push(annotation);
        newData.x = annotation.X;
        newData.y = annotation.Y;
      }

      if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
        annotation.setCustomData(SIZE_AND_POSITION, JSON.stringify(newData));
      }
    });

    handleEventTracking(resizedFieldList, UserEventConstants.EventType.RESIZE_FORM_BUILDER_ELEMENT);
    handleEventTracking(movedFieldList, UserEventConstants.EventType.MOVE_FORM_BUILDER_ELEMENT);
  };

  const handleAddAnnotationOnChange = useCallback((annotations, objectInfo) => {
    const addedPlaceHolderList = [];
    annotations.forEach((annotation) => {
      if (annotation.getCustomData(AI_AUTO_ADDED) === 'true') {
        setIsValid(true);
        isInAutoDetectionModeRef.current = true;
      }
      const data = JSON.stringify({
        height: annotation.Height,
        width: annotation.Width,
        x: annotation.X,
        y: annotation.Y,
      });
      annotation.setCustomData(NEW_FORM_FIELD_IN_SESSION, 'true');
      annotation.setCustomData(SIZE_AND_POSITION, data);
      if (!objectInfo.imported) {
        handleAddAssociatedField(annotation);
        if (annotation instanceof window.Core.Annotations.TextWidgetAnnotation) {
          annotation.font.set({
            name: 'Inter',
            type: 'TrueType',
          });
        }
      }
    });
    handleEventTracking(addedPlaceHolderList, UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT);
  }, []);

  useEffect(() => {
    const onAnnotationChanged = (annotations, action, objectInfo) => {
      const isInFormFieldCreationMode = formFieldCreationManager.isInFormFieldCreationMode();
      if (!isInFormFieldCreationMode) {
        return;
      }
      formBuilder.handleAnnotationChange({ annotations, action });
      if (action === ANNOTATION_ACTION.ADD) {
        handleAddAnnotationOnChange(annotations, objectInfo);
      }
      if (action === ANNOTATION_ACTION.MODIFY) {
        handleModifyAction(annotations);
        annotations.forEach((annotation) => {
          if (!objectInfo.imported) {
            handleAddAssociatedField(annotation);
          }
        });
      }
      if (action === ANNOTATION_ACTION.DELETE && !objectInfo.imported) {
        handleEventTracking(annotations, UserEventConstants.EventType.DELETE_FORM_BUILDER_ELEMENT);
      }
      if (action !== ANNOTATION_ACTION.DELETE) {
        hideNonWidgetAnnotations({ annotations });
      }
      if (action === ANNOTATION_ACTION.DELETE && objectInfo.source === 'changeFormFieldType') {
        const signature = annotations.find((annot) => annot.Subject === AnnotationSubjectMapping.signature);
        if (signature) {
          formBuilder.pushDeletedSignature(signature);
        }
      }
    };

    annotManager.addEventListener('annotationChanged', onAnnotationChanged);
    return () => {
      annotManager.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, []);

  useEffect(() => {
    const setNewAnnotData = (annotation) => {
      annotation.setCustomData(NEW_FORM_FIELD_IN_SESSION, 'true');
      if (currentSessionIdRef.current) {
        annotation.setCustomData(FIELD_SESSION_ID, currentSessionIdRef.current);
      }
    };

    const onAnnotationAdded = (annotation) => {
      setAnnotationModified(true);
      setNewAnnotData(annotation);
      handleEventTracking([annotation], UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT);
    };

    const onCheckBoxFieldAdded = (annotation) => {
      const { Width, Height } = annotation;
      const minDimension = Math.min(Width, Height);
      annotation.setWidth(minDimension);
      annotation.setHeight(minDimension);
      annotation.MaintainAspectRatio = true;
      redrawAnnotation(annotation);
      setAnnotationModified(true);
      annotManager.trigger('annotationChanged', [[annotation], 'modify', { imported: true }]);
      setNewAnnotData(annotation);
      handleEventTracking([annotation], UserEventConstants.EventType.ADD_FORM_BUILDER_ELEMENT);
    };

    core.getTool('RadioButtonFormFieldCreateTool').addEventListener('annotationAdded', onAnnotationAdded);

    core.getTool('TextFormFieldCreateTool').addEventListener('annotationAdded', onAnnotationAdded);

    core.getTool('CheckBoxFormFieldCreateTool').addEventListener('annotationAdded', onCheckBoxFieldAdded);

    core.getTool('SignatureFormFieldCreateTool').addEventListener('annotationAdded', onAnnotationAdded);
    return () => {
      core.getTool('TextFormFieldCreateTool').removeEventListener('annotationAdded', onAnnotationAdded);

      core.getTool('RadioButtonFormFieldCreateTool').removeEventListener('annotationAdded', onAnnotationAdded);

      core.getTool('CheckBoxFormFieldCreateTool').removeEventListener('annotationAdded', onCheckBoxFieldAdded);

      core.getTool('SignatureFormFieldCreateTool').removeEventListener('annotationAdded', onAnnotationAdded);
    };
  }, []);

  useEffect(() => {
    const onFormFieldEndedDebounced = debounce(onFormFieldEnded, ANNOTATION_DRAWN_DEBOUNCE_TIME);
    function onFormFieldEnded() {
        isFormFieldEnded.current = false;
        const annotations = core.getAnnotationsList();
        const widgetAnnotations = annotations.filter(
          (annotation) => annotation instanceof window.Core.Annotations.WidgetAnnotation
        );
        const annotationManager = core.getAnnotationManager();
        let associatedSignatures = annotations.filter(
          (annotation) =>
            annotation.Subject === AnnotationSubjectMapping.signature &&
            annotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key)
        );
        widgetAnnotations.forEach((annotation) => {
          if (annotation instanceof window.Core.Annotations.SignatureWidgetAnnotation) {
            const signature = annotation.getAssociatedSignatureAnnotation();
            if (signature) {
              annotationManager.trigger('annotationChanged', [[signature], 'modify', { force: true }]);
              associatedSignatures = associatedSignatures.filter(
                (signatureAnnot) => signatureAnnot.Id !== signature.Id
              );
            }
          }
        });
        core.drawAnnotationsFromList(widgetAnnotations);
        if (associatedSignatures.length) {
          annotationManager.deleteAnnotations(associatedSignatures, { force: true });
        }
      if (!currentDocument.isSystemFile) {
        const operationId = startOperation(SAVE_OPERATION_TYPES.FORM_BUILDER, {
          documentId: currentDocument._id,
        });

        formBuilder.exportWidgetXfdf(currentDocument._id);
        formBuilder.publishDeletedSignatures();

        completeOperation(operationId, {
          status: SAVE_OPERATION_STATUS.SUCCESS,
        });
      }
      setAnnotationModified(false);
      checkByDefaultMapping.current = {};
      closeToolPropertiesPanel();
  }
    const onAnnotationDrawn = (pageNumber) => {
      if (isFormFieldEnded.current) {
        onFormFieldEndedDebounced();
      }
      if (core.getFormFieldCreationManager().isInFormFieldCreationMode()) {
        const widgets = core
          .getAnnotationsList()
          .filter(
            (annot) => annot.PageNumber === pageNumber && annot instanceof window.Core.Annotations.WidgetAnnotation
          );
        widgets.forEach((widget) => {
          if (widget.element) {
            widget.Listable = true;
          }
        });
      }
    };

    annotManager.addEventListener('annotationsDrawn', onAnnotationDrawn);
    return () => {
      annotManager.removeEventListener('annotationsDrawn', onAnnotationDrawn);
    };
  }, [currentDocument, currentUser]);

  useEffect(() => {
    if (formFieldAnnotation) {
      const map = {
        [TOOLS_NAME.TEXT_FIELD]: FORM_FIELD_TYPE.TEXT,
        [TOOLS_NAME.CHECK_BOX]: FORM_FIELD_TYPE.CHECKBOX,
        [TOOLS_NAME.RADIO]: FORM_FIELD_TYPE.RADIO,
        [TOOLS_NAME.SIGNATURE_FIELD]: FORM_FIELD_TYPE.SIGNATURE,
      };
      const intent = map[formFieldAnnotation.ToolName];

      const newFieldName = formFieldAnnotation.fieldName;
      const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
      const deduplicateRadioGroups = [
        ...new Set([...radioButtonGroups, ...formFieldCreationManager.getRadioButtonGroups()]),
      ].sort((a, b) => collator.compare(a, b));
      oldName.current = newFieldName;
      const newTabActive = [
        FORM_FIELD_TYPE.TEXT,
        FORM_FIELD_TYPE.CHECKBOX,
        FORM_FIELD_TYPE.RADIO,
        FORM_FIELD_TYPE.SIGNATURE,
      ].includes(intent)
        ? intent
        : '';
      setTabValue(newTabActive);
      setFieldName(newFieldName);
      setFieldValue(formFieldAnnotation.getValue());
      const field = formFieldAnnotation.getField();
      setReadOnly(field.flags.get(window.Core.Annotations.WidgetFlags.READ_ONLY));
      setMultiLine(field.flags.get(window.Core.Annotations.WidgetFlags.MULTILINE));
      setRadioButtonGroups(deduplicateRadioGroups);
      setIsValid(true);
      setValidationMessage('');
    } else {
      const tabValue = MAP_TOOL_NAME_TO_TAB[core.getToolMode().name];
      if (!isNil(tabValue)) {
        setTabValue(tabValue);
      }
    }
  }, [formFieldAnnotation]);

  const onFieldValueChange = useCallback(
    (value, _type) => {
      setFieldValue(value);
      formFieldAnnotation.setValue(value);
      formFieldAnnotation.getField().setValue(value);
      formBuilder.modify(formFieldAnnotation.fieldName);
      setAnnotationModified(true);
    },
    [formFieldAnnotation]
  );

  const handleSaveToggleFieldFlag = (annot) => {
    const currentFieldName = annot.fieldName;
    if (currentFieldName) {
      formBuilder.modify(currentFieldName);
    }
  };

  const onReadOnlyChange = useCallback(
    (isReadOnlyValue) => {
      setReadOnly(isReadOnlyValue);
      formFieldAnnotation.setFieldFlag(window.Core.Annotations.WidgetFlags.READ_ONLY, isReadOnlyValue);
      setAnnotationModified(true);
      handleSaveToggleFieldFlag(formFieldAnnotation);
    },
    [formFieldAnnotation]
  );

  const onMultiLineChange = useCallback(
    (isMultiLineValue) => {
      setMultiLine(isMultiLineValue);
      formFieldAnnotation.setFieldFlag(window.Core.Annotations.WidgetFlags.MULTILINE, isMultiLineValue);
      setAnnotationModified(true);
      handleSaveToggleFieldFlag(formFieldAnnotation);
    },
    [formFieldAnnotation]
  );

  const applyFormFields = useCallback(() => {
    dispatch(setIsApplyingFormFieldDetection(false));
    const annotList = core.getAnnotationsList();
    const placeholderAnnots = annotList;
    const newFieldList = [];

    placeholderAnnots.forEach((annot) => {
      if (annot.getCustomData(NEW_FORM_FIELD_IN_SESSION) === 'true') {
        annot.setCustomData(NEW_FORM_FIELD_IN_SESSION, 'false');
        newFieldList.push(annot);
      }
    });

    handleEventTracking(newFieldList, UserEventConstants.EventType.APPLY_FORM_BUILDER_ELEMENT);
    if (newFieldList.length) {
    // TODO: temporary disable due to AI server not ready to receive data
    // handleProcessAppliedFormFields({ appliedFormFields: newFieldList, documentId: currentDocument._id });
    }
    if (currentDocument.isSystemFile && !currentDocument.unsaved) {
      dispatch(actions.setCurrentDocument({ ...currentDocument, unsaved: true }));
    }
    formFieldCreationManager.endFormFieldCreationMode();
    if (isFeedbackFormEligibleForDisplay() && isInAutoDetectionModeRef.current) {
      dispatch(openFeedbackForm());
      setLastFeedbackFormDisplayTime();
    }

    if (!isSystemFile && enabledForLuminStorage) {
      backupAnnotations();
    }

    if (isExploringFeature && !isInAutoDetectionModeRef.current) {
      increaseExploredFeatureUsage({ key: ExploredFeatureKeys.FORM_BUILDER });
    }
  }, [
    annotManager,
    currentDocument,
    dispatch,
    formFieldCreationManager,
    isFeedbackFormEligibleForDisplay,
    isSystemFile,
    backupAnnotations,
    enabledForLuminStorage,
    isExploringFeature,
    handleProcessAppliedFormFields,
  ]);

  const onTabsValueChange = useCallback(({ id, toolName }) => {
    setTabValue(id);
    core.setToolMode(toolName);
    resetAnnotation();
  }, []);

  const contextValue = {
    onTabsValueChange,
    tabValue,
    fieldName,
    validationMessage,
    formFieldAnnotation,
    onFieldValueChange,
    fieldValue,
    onReadOnlyChange,
    isReadOnly,
    onMultiLineChange,
    isMultiLine,
    handleStyleChange,
    applyFormFields,
    redrawAnnotation,
    setFieldName,
    isValid,
    setIsValid,
    setValidationMessage,
    oldName,
    radioButtonGroups,
    setRadioButtonGroups,
    resetAnnotation,
  };

  return (
    <FormBuilderContext.Provider value={contextValue}>
      <FormFieldDimensionContext.Provider value={{ width, height, setDimension }}>
        <Styled.FormBuilder>
          <FormBuilderHeader />

          <FormBuilderMainContent />

          <FormBuilderFooter />
        </Styled.FormBuilder>
      </FormFieldDimensionContext.Provider>
    </FormBuilderContext.Provider>
  );
};

export default FormBuilder;
