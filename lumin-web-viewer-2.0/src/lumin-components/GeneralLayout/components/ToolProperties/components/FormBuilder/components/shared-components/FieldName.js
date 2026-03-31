import debounce from 'lodash/debounce';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import core from 'core';

import TextField from 'luminComponents/GeneralLayout/general-components/TextField';

import { useTranslation } from 'hooks';

import { setAnnotationModified } from 'helpers/toggleFormFieldCreationMode';

import { formBuilder } from 'features/DocumentFormBuild';

import { MAX_INPUT_FORM_FIELD_NAME_LENGTH } from 'constants/formBuildTool';

import * as Styled from '../../FormBuilder.styled';
import FormBuilderContext from '../../formBuilderContext';

const DEBOUNCE_INPUT_TIME = 500;

const FieldName = React.forwardRef((props, ref) => {
  const { t } = useTranslation();
  const {
    fieldName,
    validationMessage,
    formFieldAnnotation,
    setFieldName,
    isValid,
    setIsValid,
    setValidationMessage,
    oldName,
  } = useContext(FormBuilderContext);
  const formFieldCreationManager = core.getFormFieldCreationManager();
  const annotManager = core.getAnnotationManager();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setIsValid(!validationMessage && !isFocused);
  }, [validationMessage, isFocused]);

  const validationStrategies = {
    empty: ({ name }) => (!name.trim().length ? t('viewer.formBuildPanel.fieldNameMustNotBeEmpty') : ''),
    duplicate: ({ name, formFieldAnnotation, annotManager }) =>
      annotManager
        .getAnnotationsList()
        .some(
          (annotation) =>
            annotation.fieldName === name.trim() && annotation.Id !== formFieldAnnotation.Id
        )
        ? t('viewer.formBuildPanel.fieldNameMustNotCoincide')
        : '',
  };

  const mapValidationResponseToTranslation = ({ validatedResponse, name = '', formFieldAnnotation }) => {
    setValidationMessage('');

    if (validatedResponse.isValid) {
      return;
    }

    const message = Object.values(validationStrategies)
      .map((strategy) => strategy({ name, formFieldAnnotation, annotManager }))
      .find((msg) => msg !== '');

    setValidationMessage(message || '');
  };

  const onFocus = () => {
    setIsFocused(true);
  };

  const handleChangeFieldName = (formFieldName) => {
    if (formFieldAnnotation) {
      const name = formFieldName.replace(/^\.|\.$/, '').trim();
      const prevFieldName =
        (!isValid && oldName.current) ? oldName.current : formFieldAnnotation.fieldName;
      const validatedResponse = formFieldCreationManager.setFieldName(formFieldAnnotation, name);
      mapValidationResponseToTranslation({ validatedResponse, name, formFieldAnnotation });
      setFieldName(name);
      if (validatedResponse.isValid) {
        formBuilder.rename(prevFieldName, name);
        oldName.current = name;
        setFieldName(name);
      }
      setAnnotationModified(true);
    }
  };

  const debounceChangeFieldName = useCallback(debounce(handleChangeFieldName, DEBOUNCE_INPUT_TIME), [
    formFieldAnnotation?.Id,
    validationMessage,
  ]);

  const onInputChange = (formFieldName) => {
    setFieldName(formFieldName);
    debounceChangeFieldName(formFieldName);
  };

  const onFieldNameBlur = () => {
    debounceChangeFieldName.cancel();
    handleChangeFieldName(fieldName);
    setIsFocused(false);
  };

  useEffect(() => {
    const onAnnotationSelected = (annotations, action) => {
      if (action === 'deselected' && !isValid && formFieldCreationManager.isInFormFieldCreationMode()) {
        handleChangeFieldName(oldName.current);
        oldName.current = '';
      }
    };

    annotManager.addEventListener('annotationSelected', onAnnotationSelected);
    return () => {
      annotManager.removeEventListener('annotationSelected', onAnnotationSelected);
    };
  }, [isValid]);

  return (
    <>
      <Styled.FieldLabel>{t('viewer.formBuildPanel.fieldName')}</Styled.FieldLabel>
      <TextField
        placeholder={t('viewer.formBuildPanel.nameOfField')}
        onChange={(event) => onInputChange(event.target.value)}
        onFocus={onFocus}
        required
        value={fieldName}
        error={!!validationMessage}
        errorText={validationMessage}
        onBlur={onFieldNameBlur}
        ref={ref}
        inputProps={{ maxLength: MAX_INPUT_FORM_FIELD_NAME_LENGTH }}
        {...props}
      />
    </>
  );
});

export default FieldName;
