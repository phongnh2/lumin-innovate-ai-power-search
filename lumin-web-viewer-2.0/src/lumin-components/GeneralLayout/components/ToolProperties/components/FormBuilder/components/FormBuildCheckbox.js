import FormControlLabel from '@mui/material/FormControlLabel';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';

import Checkbox from 'luminComponents/GeneralLayout/general-components/Checkbox';

import FieldDimensionComponent from './shared-components/FieldDimension';
import FieldName from './shared-components/FieldName';
import FieldProperties from './shared-components/FieldProperties';
import * as Styled from '../FormBuilder.styled';
import FormBuilderContext from '../formBuilderContext';

const FormBuildCheckbox = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const formClasses = Styled.useFormControlStyled({ theme });
  const { onFieldValueChange, formFieldAnnotation, fieldValue } = useContext(FormBuilderContext);

  const getCheckedValue = () => Object.keys(formFieldAnnotation.appearances ?? {}).find((key) => key !== 'Off') ?? 'Yes';

  const onCheckedByDefaultChange = (event) => {
    const value = event.target.checked ? getCheckedValue() : 'Off';
    onFieldValueChange(value);
    formFieldAnnotation.setValue(value);
    formFieldAnnotation.refresh();
  };

  return (
    <>
      <Styled.BaseSection>
        <FieldName />
      </Styled.BaseSection>

      <Styled.BaseSection>
        <FieldProperties>
          <FormControlLabel
            classes={formClasses}
            control={
              <Checkbox
                id="check_by_default"
                type="checkbox"
                checked={getCheckedValue() === fieldValue}
                onChange={onCheckedByDefaultChange}
              />
            }
            label={t('viewer.formBuildPanel.checkByDefault')}
          />
        </FieldProperties>
      </Styled.BaseSection>

      <Styled.BaseSection>
        <FieldDimensionComponent squaredField />
      </Styled.BaseSection>
    </>
  );
};

export default FormBuildCheckbox;
