import { StickerIcon } from '@luminpdf/icons/dist/csr/Sticker';
import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import selectors from 'selectors';

import { useRestrictedUser } from 'hooks/useRestrictedUser';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import { setIsOpenSaveAsTemplate } from 'features/SaveAsTemplate/slices';

const SaveAsTemplate = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isOffline = useShallowSelector(selectors.isOffline);
  const { isTemplateViewer } = useTemplateViewerMatch();
  const { templateManagementEnabled } = useRestrictedUser();

  const handleOpenSaveAsTemplateModal = () => {
    dispatch(setIsOpenSaveAsTemplate(true));
  };

  if (!templateManagementEnabled || currentDocument.isSystemFile || isOffline || isTemplateViewer) {
    return null;
  }

  return (
    <MenuItem
      leftSection={<StickerIcon size={24} />}
      onClick={handleOpenSaveAsTemplateModal}
      data-lumin-btn-name={ButtonName.SAVE_AS_TEMPLATE}
    >
      {t('viewer.saveAsTemplate.title')}
    </MenuItem>
  );
};

export default SaveAsTemplate;
