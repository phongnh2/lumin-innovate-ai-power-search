import React, { useContext } from 'react';

import PopupLinkBtn from 'lumin-components/GeneralLayout/components/PopupLinkBtn';
import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { AnnotationPopupContext } from '../../AnnotationPopupContext';
import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

const LinkBtn = () => {
  const { handleAssociatedLink } = useAnnotationPopupAction();
  const { showLinkButton } = useAnnotationPopupBtnCondition();
  const { hasAssociatedLink } = useContext(AnnotationPopupContext);
  const { t } = useTranslation();

  if (!showLinkButton) return null;

  if (hasAssociatedLink) {
    return (
      <IconButton
        dataElement="linkButton"
        icon="new_unlink"
        iconSize={24}
        onClick={handleAssociatedLink}
        tooltipData={{ location: 'bottom', title: t('viewer.annotationPopup.removeLink') }}
      />
    );
  }

  return <PopupLinkBtn />;
};

LinkBtn.propTypes = {};

export default LinkBtn;
