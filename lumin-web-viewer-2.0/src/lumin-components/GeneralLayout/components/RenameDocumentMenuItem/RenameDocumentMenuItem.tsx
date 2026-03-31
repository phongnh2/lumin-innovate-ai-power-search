import { TextboxIcon } from '@luminpdf/icons/dist/csr/Textbox';
import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useTranslation } from 'hooks/useTranslation';

import { openRenameDocumentModal } from 'features/RenameDocumentModalContainer/slices';

const RenameDocumentMenuItem = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const onClickMenuItem = () => {
    dispatch(openRenameDocumentModal());
  };

  return (
    <MenuItem leftSection={<TextboxIcon size={24} />} onClick={onClickMenuItem}>
      {t('modalRenameDocument.renameDocument')}
    </MenuItem>
  );
};

export default RenameDocumentMenuItem;
