import { TFunction } from 'i18next';
import React from 'react';

import FocusModeMenuItem from '@new-ui/components/FocusModeMenuItem';
import { SignAndSendBtn } from '@new-ui/components/LuminToolbar/tools-components';
import RenameDocumentMenuItem from '@new-ui/components/RenameDocumentMenuItem';

import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

export const getRemainingTools = (t: TFunction): QuickSearchToolType[] => [
  {
    key: QUICK_SEARCH_TOOLS.RENAME_DOCUMENT,
    title: t('modalRenameDocument.renameDocument'),
    element: <RenameDocumentMenuItem />,
  },
  {
    key: QUICK_SEARCH_TOOLS.FOCUS_MODE,
    title: t('generalLayout.focusMode.tooltip'),
    element: <FocusModeMenuItem />,
  },
  {
    key: QUICK_SEARCH_TOOLS.SIGN_SECURELY,
    title: t('viewer.bananaSign.secureSigning'),
    element: <SignAndSendBtn shouldShowAsMenuItem />,
  },
];
