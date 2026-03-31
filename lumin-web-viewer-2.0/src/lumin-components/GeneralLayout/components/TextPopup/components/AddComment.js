import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';

import actions from 'actions';
import selectors from 'selectors';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import createTextAnnotationAndSelect from 'helpers/createTextAnnotationAndSelect';

import { ShowValues } from 'features/Comments/constants';

import DataElements from 'constants/dataElement';

import useTextPopupConditions from '../hooks/useTextPopupConditions';

const AddComment = () => {
  const { isPageEditMode, isDisabledSticky } = useTextPopupConditions();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue);
  const closeRightPanel = () => {
    dispatch(actions.setShowNotesOption(ShowValues.SHOW_ALL));
    dispatch(actions.setIsRightPanelOpen(false));
    if (toolPropertiesValue === TOOL_PROPERTIES_VALUE.MEASURE) {
      dispatch(actions.setDisplayCommentPanel(false));
    }
  };

  return !isPageEditMode && !isDisabledSticky ? (
    <IconButton
      data-element={DataElements.STICKY_TOOL_BUTTON}
      icon="md_comment_teardrop_text"
      iconSize={24}
      onClick={() => {
        createTextAnnotationAndSelect(dispatch, window.Core.Annotations.TextHighlightAnnotation, true);
        closeRightPanel();
      }}
      tooltipData={{ location: 'bottom', title: t('annotation.stickyNote') }}
    />
  ) : null;
};

export default AddComment;
