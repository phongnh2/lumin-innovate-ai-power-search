import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

import core from 'core';

import TextField from 'luminComponents/GeneralLayout/general-components/TextField';

import { useTranslation } from 'hooks';

import { formBuilder } from 'features/DocumentFormBuild';

import { INPUT_DEBOUNCE_TIME, regexInputNumber } from 'constants/formBuildTool';

import { DIMENSION_TYPE } from '../../constants';
import * as Styled from '../../FormBuilder.styled';
import { useFormBuilderContext } from '../../formBuilderContext';
import { useFormFieldDimensionContext } from '../../FormFieldDimensionContext';
import { useInitFormFieldDimension } from '../../hooks/useInitFormFieldDimension';
import { validateHeight, validateMinDimension, validateWidth } from '../../utils';

const FieldDimension = ({ squaredField }) => {
  const { t } = useTranslation();

  const { formFieldAnnotation, redrawAnnotation, tabValue } = useFormBuilderContext();
  const { setDimension } = useFormFieldDimensionContext();
  const [internalWidth, setInternalWidth] = useState(Math.round(formFieldAnnotation.Width));
  const [internalHeight, setInternalHeight] = useState(Math.round(formFieldAnnotation.Height));

  /**
   * Debounce update font size in the `TextStyle` component
   */
  const setDimensionDebounced = useCallback(debounce(setDimension, INPUT_DEBOUNCE_TIME), []);

  const onWidthChange = (value = -1) => {
    const tester = new RegExp(regexInputNumber);
    if (value && !tester.test(value)) {
      return;
    }
    const validatedWidth = validateWidth(value, formFieldAnnotation);
    formFieldAnnotation.setWidth(validatedWidth);
    setDimensionDebounced((prev) => ({
      ...prev,
      width: validatedWidth,
    }));
    setInternalWidth(validatedWidth);
    redrawAnnotation(formFieldAnnotation);
    const currentFieldName = formFieldAnnotation.fieldName;
    if (currentFieldName) {
      formBuilder.modify(currentFieldName);
    }
  };

  const onHeightChange = (value = -1) => {
    const tester = new RegExp(regexInputNumber);
    if (value && !tester.test(value)) {
      return;
    }

    const validatedHeight = validateHeight(value, formFieldAnnotation);
    formFieldAnnotation.setHeight(validatedHeight);
    setDimensionDebounced((prev) => ({
      ...prev,
      height: validatedHeight,
    }));
    setInternalHeight(validatedHeight);
    redrawAnnotation(formFieldAnnotation);
    const currentFieldName = formFieldAnnotation.fieldName;
    if (currentFieldName) {
      formBuilder.modify(currentFieldName);
    }
  };

  const handleBlur = () => {
    const newWidth = validateMinDimension({ value: internalWidth, type: tabValue, dimension: DIMENSION_TYPE.WIDTH });
    const newHeight = validateMinDimension({ value: internalHeight, type: tabValue, dimension: DIMENSION_TYPE.HEIGHT });
    onWidthChange(newWidth);
    onHeightChange(newHeight);
  };

  const renderDimensionInputs = (squaredField) => {
    if (squaredField) {
      return (
        <TextField
          value={internalWidth}
          onChange={({ target: { value } }) => {
              onWidthChange(value);
              onHeightChange(value);
            }}
          onBlur={handleBlur}
        />
      );
    }

    return (
      <Styled.DimensionContainer>
        <TextField
          value={internalWidth}
          label={`${t('viewer.formBuildPanel.width')} (px)`}
          onChange={({ target: { value } }) => onWidthChange(value)}
          onBlur={handleBlur}
        />

        <TextField
          value={internalHeight}
          label={`${t('viewer.formBuildPanel.height')} (px)`}
          onChange={({ target: { value } }) => onHeightChange(value)}
          onBlur={handleBlur}
        />
      </Styled.DimensionContainer>
    );
  };

  useEffect(() => {
    const onAnnotationChanged = (annotations) => {
      if (annotations[0] === formFieldAnnotation) {
        onWidthChange(
          validateMinDimension({
            value: Math.round(annotations[0].Width),
            type: tabValue,
            dimension: DIMENSION_TYPE.WIDTH,
          })
        );
        onHeightChange(
          validateMinDimension({
            value: Math.round(annotations[0].Height),
            type: tabValue,
            dimension: DIMENSION_TYPE.HEIGHT,
          })
        );
      }
    };
    core.addEventListener('annotationChanged', onAnnotationChanged);

    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, [tabValue]);

  useInitFormFieldDimension();

  return (
    <>
      <Styled.FieldLabel>{t('viewer.formBuildPanel.size')}</Styled.FieldLabel>

      {renderDimensionInputs(squaredField)}
    </>
  );
};

FieldDimension.propTypes = {
  squaredField: PropTypes.bool,
};

FieldDimension.defaultProps = {
  squaredField: false,
};

export default FieldDimension;
