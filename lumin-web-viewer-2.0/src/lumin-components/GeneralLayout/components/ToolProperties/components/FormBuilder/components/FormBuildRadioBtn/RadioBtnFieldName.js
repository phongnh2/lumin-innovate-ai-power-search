import React, { useContext, useRef, useState } from 'react';

import Popper from '@new-ui/general-components/Popper';
import TextField from '@new-ui/general-components/TextField';

import { useTranslation } from 'hooks';

import { MAX_INPUT_FORM_FIELD_NAME_LENGTH } from 'constants/formBuildTool';

import RadioBtnFieldNameContent from './RadioBtnFieldNameContent';
import * as Styled from '../../FormBuilder.styled';
import FormBuilderContext from '../../formBuilderContext';

const RadioBtnFieldName = () => {
  const { t } = useTranslation();
  const anchorEl = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { radioButtonGroups, setFieldName, fieldName } = useContext(FormBuilderContext);
  const displayRadioGroups = radioButtonGroups.map((group) => ({ value: group, label: group }));

  const onInputChange = (formFieldName) => {
    setFieldName(formFieldName);
  };

  const handleOpenPopover = () => {
    setOpen(true);
  };

  const handleClosePopover = () => {
    setOpen(false);
  };

  const getContentWidth = () => anchorEl.current?.offsetWidth || 0;

  const generateExtraTextFieldProps = (displayRadioGroups) => {
    if (displayRadioGroups.length > 0) {
      return {
        showSuffix: true,
        suffixProps: { className: 'sm_down_solid', iconSize: 16 },
      };
    }

    return {};
  };

  return (
    <>
      <Styled.FieldLabel>{t('viewer.formBuildPanel.fieldName')}</Styled.FieldLabel>
      <TextField
        placeholder={t('viewer.formBuildPanel.nameOfField')}
        onChange={(event) => onInputChange(event.target.value)}
        onClick={handleOpenPopover}
        ref={anchorEl}
        required
        value={fieldName}
        inputProps={{ ref: inputRef, maxLength: MAX_INPUT_FORM_FIELD_NAME_LENGTH }}
        {...generateExtraTextFieldProps(displayRadioGroups)}
      />

      {displayRadioGroups.length > 0 && (
        <Popper
          open={open}
          anchorEl={anchorEl.current}
          onClose={handleClosePopover}
          disableAutoFocus
          disableEnforceFocus
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: -8,
            horizontal: 'center',
          }}
        >
          <div style={{ width: getContentWidth() }}>
            <RadioBtnFieldNameContent displayRadioGroups={displayRadioGroups} handleClosePopover={handleClosePopover} />
          </div>
        </Popper>
      )}

      <Styled.RadioBtnDesc>{t('viewer.formBuildPanel.radioDescription')}</Styled.RadioBtnDesc>
    </>
  );
};

export default RadioBtnFieldName;
