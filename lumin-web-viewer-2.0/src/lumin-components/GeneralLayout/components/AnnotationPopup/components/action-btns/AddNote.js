import React from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks/useTranslation';

import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

const AddNote = () => {
  const { addComment } = useAnnotationPopupAction();
  const { showCommentButton } = useAnnotationPopupBtnCondition();

  const { t } = useTranslation();

  return showCommentButton ? (
    <IconButton
      dataElement="annotationCommentButton"
      icon="add-comment"
      iconSize={18}
      onClick={addComment}
      tooltipData={{ location: 'bottom', title: t('common.comment') }}
    />
  ) : null;
};

export default AddNote;
