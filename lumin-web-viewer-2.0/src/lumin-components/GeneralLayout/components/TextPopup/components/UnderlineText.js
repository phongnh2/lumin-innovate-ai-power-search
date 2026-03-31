import React from 'react';
import { useDispatch } from 'react-redux';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import createTextAnnotationAndSelect from 'helpers/createTextAnnotationAndSelect';

import DataElements from 'constants/dataElement';

import useTextPopupConditions from '../hooks/useTextPopupConditions';

const UnderlineText = () => {
  const { isDisabledUnderline } = useTextPopupConditions();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  return !isDisabledUnderline ? (
    <IconButton
      data-element={DataElements.TEXT_UNDERLINE_TOOL_BUTTON}
      icon="md_text_underline"
      iconSize={24}
      onClick={() => {
        createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextUnderlineAnnotation);
      }}
      tooltipData={{ location: 'bottom', title: t('annotation.underline') }}
    />
  ) : null;
};

export default UnderlineText;
