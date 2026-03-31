import React, { useState } from 'react';

import TextField from 'lumin-components/GeneralLayout/general-components/TextField';
import IconButton from 'luminComponents/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { DIR } from '../constants';
import * as Styled from '../RotatePanel.styled';
import useRotateAction from '../useRotateAction';

export const RotateByRange = () => {
  const { t } = useTranslation();
  const { validatePageInput, rotateByRange } = useRotateAction();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onInputChange = (value, forFrom) => {
    const regex = /^[\d]*$/g;
    if (!regex.test(value)) {
      return;
    }
    const errorMessage = validatePageInput(value);
    if (forFrom) {
      setFrom(value);
    } else {
      setTo(value);
    }
    setErrorMsg(errorMessage);
  };

  return (
    <>
      <Styled.Title>{t('viewer.leftPanelEditMode.rotateByRange')}</Styled.Title>
      <Styled.MainContent>
        <Styled.RotateByRangeInputContainer data-cy="rotate_by_range_input_container">
          <Styled.InputWrapper>
            <Styled.Label>{t('viewer.leftPanelEditMode.from')}</Styled.Label>
            <TextField
              onChange={(e) => onInputChange(e.target.value, true)}
              value={from}
              error={!!errorMsg}
              placeholder={t('message.EGPages', { pages: '1' })}
            />
          </Styled.InputWrapper>
          <Styled.InputWrapper>
            <Styled.Label>{t('viewer.leftPanelEditMode.to')}</Styled.Label>
            <TextField
              onChange={(e) => onInputChange(e.target.value)}
              value={to}
              error={!!errorMsg}
              placeholder={t('message.EGPages', { pages: '8' })}
            />
          </Styled.InputWrapper>

          <IconButton
            disabled={!!errorMsg}
            icon="md_rotate_counter_clockwise"
            iconSize={24}
            onClick={() => rotateByRange(DIR.LEFT, from, to)}
            tooltipData={{ location: 'bottom', title: t('viewer.leftPanelEditMode.counterClockwise') }}
          />
          <IconButton
            disabled={!!errorMsg}
            icon="md_rotate_clockwise"
            iconSize={24}
            onClick={() => rotateByRange(DIR.RIGHT, from, to)}
            tooltipData={{ location: 'bottom', title: t('viewer.leftPanelEditMode.clockwise') }}
          />
        </Styled.RotateByRangeInputContainer>

        {!!errorMsg && <Styled.Error>{errorMsg}</Styled.Error>}
      </Styled.MainContent>
    </>
  );
};

RotateByRange.propTypes = {};

export default RotateByRange;
