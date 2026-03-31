import { TFunction } from 'i18next';
import React from 'react';

import PasswordSettingMenu, {
  PASSWORD_MENU_RENDER_MODE,
} from '@new-ui/components/LuminToolbar/components/PasswordSettingMenu';
import RedactionTool from '@new-ui/components/LuminToolbar/tools-components/RedactionTool';

import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

export const getSecurityTools = ({
  t,
  canChangePassword,
}: {
  t: TFunction;
  canChangePassword: boolean;
}): QuickSearchToolType[] => [
  {
    key: QUICK_SEARCH_TOOLS.REDACTION,
    title: t('annotation.redact'),
    element: <RedactionTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.CONFIGURE_ACCESS,
    title: canChangePassword ? t('common.changePassword') : t('common.setPassword'),
    element: <PasswordSettingMenu renderMode={PASSWORD_MENU_RENDER_MODE.SET_OR_CHANGE} />,
  },
  {
    key: QUICK_SEARCH_TOOLS.REMOVE_ACCESS,
    title: t('common.removePassword'),
    element: <PasswordSettingMenu renderMode={PASSWORD_MENU_RENDER_MODE.REMOVE} />,
  },
];
