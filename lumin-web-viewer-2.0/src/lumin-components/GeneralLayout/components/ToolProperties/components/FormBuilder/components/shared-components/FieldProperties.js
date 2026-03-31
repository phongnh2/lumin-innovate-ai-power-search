/* eslint-disable import/no-cycle */
import FormControlLabel from '@mui/material/FormControlLabel';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useTheme } from 'styled-components';

import Checkbox from 'luminComponents/GeneralLayout/general-components/Checkbox';

import { useTranslation } from 'hooks';

import * as Styled from '../../FormBuilder.styled';
import FormBuilderContext from '../../formBuilderContext';

const FieldProperties = ({ children }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const formClasses = Styled.useFormControlStyled({ theme });
  const { onReadOnlyChange, isReadOnly } = useContext(FormBuilderContext);

  return (
    <>
      <Styled.FieldLabel>{t('viewer.formBuildPanel.setFieldProperty')}</Styled.FieldLabel>
      <Styled.CheckboxesWrapper>
        <FormControlLabel
          label={t('viewer.formBuildPanel.readOnly')}
          classes={formClasses}
          control={
            <Checkbox
              id={t('viewer.formBuildPanel.readOnly')}
              type="checkbox"
              checked={isReadOnly}
              onChange={(event) => onReadOnlyChange(event.target.checked)}
            />
          }
        />
        {children}
      </Styled.CheckboxesWrapper>
    </>
  );
};

FieldProperties.propTypes = {
  children: PropTypes.node,
};

FieldProperties.defaultProps = {
  children: null,
};

export default FieldProperties;
