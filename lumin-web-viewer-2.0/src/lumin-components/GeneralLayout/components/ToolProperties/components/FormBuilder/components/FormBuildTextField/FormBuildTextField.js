import FormControlLabel from '@mui/material/FormControlLabel';
import React, { useContext } from 'react';
import { useTheme } from 'styled-components';

import Checkbox from 'luminComponents/GeneralLayout/general-components/Checkbox';
import TextField from 'luminComponents/GeneralLayout/general-components/TextField';

import { useTranslation } from 'hooks';

import { FIELD_VALUE_MAX_LENGTH } from 'constants/formBuildTool';

import TextFieldStyle from './FormBuildTextFieldStyle';
import * as Styled from '../../FormBuilder.styled';
import FormBuilderContext from '../../formBuilderContext';
import ConnectedFieldDimension from '../shared-components/FieldDimension';
import FieldName from '../shared-components/FieldName';
import FieldProperties from '../shared-components/FieldProperties';

const FormBuildTextField = () => {
  const { t } = useTranslation();
  const { onFieldValueChange, fieldValue, isMultiLine, onMultiLineChange } = useContext(FormBuilderContext);
  const theme = useTheme();
  const formClasses = Styled.useFormControlStyled({ theme });

  return (
    <>
      <Styled.BaseSection>
        <FieldName />
      </Styled.BaseSection>

      <Styled.BaseSection>
        <Styled.FieldLabel>{t('viewer.formBuildPanel.defaultValue')}</Styled.FieldLabel>
        <TextField
          placeholder={t('option.watermark.text')}
          value={fieldValue}
          onChange={(event) => onFieldValueChange(event.target.value)}
          inputProps={{ maxLength: FIELD_VALUE_MAX_LENGTH }}
        />
      </Styled.BaseSection>

      <Styled.BaseSection>
        <FieldProperties>
          <FormControlLabel
            label={t('viewer.formBuildPanel.multiline')}
            classes={formClasses}
            control={
              <Checkbox
                id={t('viewer.formBuildPanel.multiline')}
                type="checkbox"
                checked={isMultiLine}
                onChange={(event) => onMultiLineChange(event.target.checked)}
              />
            }
          />
        </FieldProperties>
      </Styled.BaseSection>

      <div>
        <TextFieldStyle />
      </div>

      <Styled.BaseSection>
        <ConnectedFieldDimension />
      </Styled.BaseSection>
    </>
  );
};

export default FormBuildTextField;
