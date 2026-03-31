/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { MenuItem } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Icomoon from 'lumin-components/Icomoon';

import { AnnotationPopupContext } from '../../AnnotationPopupContext';

const NewEditStyle = () => {
  const { t } = useTranslation();
  const { setIsStylePopupOpen } = useContext(AnnotationPopupContext);
  return (
    <MenuItem leftSection={<Icomoon className="paint" size={16} />} onClick={() => setIsStylePopupOpen(true)}>
      {t('action.changeStyle')}
    </MenuItem>
  );
};

export default NewEditStyle;
