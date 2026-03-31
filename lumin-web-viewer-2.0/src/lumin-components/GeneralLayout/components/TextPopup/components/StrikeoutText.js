import React from 'react';
import { useDispatch } from 'react-redux';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import createTextAnnotationAndSelect from 'helpers/createTextAnnotationAndSelect';

import DataElements from 'constants/dataElement';

import useTextPopupConditions from '../hooks/useTextPopupConditions';

const StrikeoutText = () => {
  const { isDisabledStrikeout } = useTextPopupConditions();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  return !isDisabledStrikeout ? (
    <IconButton
      data-element={DataElements.TEXT_STRIKEOUT_TOOL_BUTTON}
      icon="md_text_strike_through"
      iconSize={24}
      onClick={() => {
        createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextStrikeoutAnnotation);
      }}
      tooltipData={{ location: 'bottom', title: t('annotation.strikeout') }}
    />
  ) : null;
};

export default StrikeoutText;
