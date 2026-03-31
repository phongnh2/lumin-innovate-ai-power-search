import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';

const NewAddNote = ({ onClosePopper }: { onClosePopper: () => void }) => {
  const { t } = useTranslation();
  const { addComment } = useAnnotationPopupAction();
  return (
    <MenuItem
      leftSection={<Icomoon className="add-comment" size={16} />}
      onClick={() => {
        onClosePopper();
        addComment();
      }}
    >
      {t('action.addComment')}
    </MenuItem>
  );
};

export default NewAddNote;
