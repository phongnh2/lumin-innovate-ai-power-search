import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Icomoon from 'luminComponents/Icomoon';

import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

const NewLinks = ({ onOpenAddLink }: { onOpenAddLink: () => void }) => {
  const { t } = useTranslation();
  const { showNavigateButton } = useAnnotationPopupBtnCondition();
  const { handleAssociatedLink } = useAnnotationPopupAction();
  if (showNavigateButton) {
    return (
      <MenuItem leftSection={<Icomoon className="new_unlink" size={16} />} onClick={handleAssociatedLink}>
        {t('viewer.annotationPopup.removeLink')}
      </MenuItem>
    );
  }

  return (
    <MenuItem leftSection={<Icomoon className="link" size={16} />} onClick={onOpenAddLink}>
      {t('action.addHyperlink')}
    </MenuItem>
  );
};

export default NewLinks;
