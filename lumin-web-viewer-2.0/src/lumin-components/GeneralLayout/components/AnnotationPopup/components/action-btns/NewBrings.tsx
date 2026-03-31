import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Divider from '@new-ui/general-components/Divider';

import Icomoon from 'luminComponents/Icomoon';

import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';

const NewBrings = () => {
  const { t } = useTranslation();
  const { bringToBackOrFront } = useAnnotationPopupAction();
  return (
    <>
      <Divider />
      <MenuItem
        leftSection={<Icomoon className="bring-to-front" size={16} />}
        onClick={() => bringToBackOrFront({ isBringToBack: false })}
      >
        {t('common.bringToFront')}
      </MenuItem>
      <MenuItem
        leftSection={<Icomoon className="send-to-back" size={16} />}
        onClick={() => bringToBackOrFront({ isBringToBack: true })}
      >
        {t('common.sendToBack')}
      </MenuItem>
    </>
  );
};

export default NewBrings;
