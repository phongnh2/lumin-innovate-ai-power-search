import React, { useState } from 'react';
import { Trans } from 'react-i18next';

import TextField from 'lumin-components/GeneralLayout/general-components/TextField';
import IconButton from 'luminComponents/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { DIR } from '../constants';
import * as Styled from '../RotatePanel.styled';
import useRotateAction from '../useRotateAction';

export const RotateByPages = () => {
  const { validatePageInput, rotateByPages } = useRotateAction();
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onInputChange = (_value) => {
    const regex = /^[\d,]*$/g;
    if (!regex.test(_value)) {
      return;
    }
    const _errorMessage = validatePageInput(_value, t);

    setErrorMsg(_errorMessage);
    setValue(_value);
  };

  return (
    <div>
      <Styled.Title>{t('viewer.leftPanelEditMode.rotateByPages')}</Styled.Title>

      <Styled.MainContent>
        <Styled.Desc>
          <Trans i18nKey="viewer.leftPanelEditMode.subTitleEditPanelRotate">
            Enter a comma separated list of page numbers to rotate <span>(leave empty for all pages)</span>.
          </Trans>
        </Styled.Desc>

        <Styled.RotateByPagesInputContainer data-cy="rotate_by_pages_input_container">
          <TextField
            placeholder={t('message.EGPages', { pages: ' 1, 4, 6' })}
            value={value}
            onChange={(e) => onInputChange(e.target.value)}
            errorText={errorMsg}
            error={!!errorMsg}
          />
          <IconButton
            disabled={!!errorMsg}
            icon="md_rotate_counter_clockwise"
            iconSize={24}
            onClick={() => rotateByPages(DIR.LEFT, value)}
            tooltipData={{ location: 'bottom', title: t('viewer.leftPanelEditMode.counterClockwise') }}
          />
          <IconButton
            disabled={!!errorMsg}
            icon="md_rotate_clockwise"
            iconSize={24}
            onClick={() => rotateByPages(DIR.RIGHT, value)}
            tooltipData={{ location: 'bottom', title: t('viewer.leftPanelEditMode.clockwise') }}
          />
        </Styled.RotateByPagesInputContainer>
      </Styled.MainContent>
    </div>
  );
};

RotateByPages.propTypes = {};

export default RotateByPages;
