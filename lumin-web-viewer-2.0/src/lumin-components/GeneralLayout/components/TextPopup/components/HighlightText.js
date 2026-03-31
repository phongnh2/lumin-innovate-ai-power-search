import React from 'react';
import { useDispatch } from 'react-redux';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import createTextAnnotationAndSelect from 'helpers/createTextAnnotationAndSelect';

import DataElements from 'constants/dataElement';

import useTextPopupConditions from '../hooks/useTextPopupConditions';

const CopyText = () => {
  const { isDisabledHighlight } = useTextPopupConditions();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  return !isDisabledHighlight ? (
    <IconButton
      data-element={DataElements.TEXT_HIGHLIGHT_TOOL_BUTTON}
      icon="md_highlight"
      iconSize={24}
      onClick={() => {
        createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextHighlightAnnotation);
      }}
      tooltipData={{ location: 'bottom', title: t('annotation.highlight') }}
    />
  ) : null;
};

export default CopyText;
