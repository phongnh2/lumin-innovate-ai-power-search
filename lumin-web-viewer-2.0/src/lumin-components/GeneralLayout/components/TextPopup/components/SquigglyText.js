import React from 'react';
import { useDispatch } from 'react-redux';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import createTextAnnotationAndSelect from 'helpers/createTextAnnotationAndSelect';

import DataElements from 'constants/dataElement';

import useTextPopupConditions from '../hooks/useTextPopupConditions';

const SquigglyText = () => {
  const { isDisabledSquiggly } = useTextPopupConditions();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  return !isDisabledSquiggly ? (
    <IconButton
      data-element={DataElements.TEXT_SQUIGGLY_TOOL_BUTTON}
      icon="md_squiggly"
      iconSize={24}
      onClick={() => {
        createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextSquigglyAnnotation);
      }}
      tooltipData={{ location: 'bottom', title: t('annotation.squiggly') }}
    />
  ) : null;
};

export default SquigglyText;
