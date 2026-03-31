import { TFunction } from 'i18next';
import React from 'react';

import FileMenu from '@new-ui/components/LuminTitleBar/components/TitleBarRightSection/components/FileMenu';

import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

const getFileMenuToolsConfiguration = ({ t, isLightMode }: { t: TFunction; isLightMode: boolean }) => [
  {
    key: QUICK_SEARCH_TOOLS.ADD_TO_STARRED,
    title: t('documentPage.addToStarred'),
  },
  {
    key: QUICK_SEARCH_TOOLS.MAKE_COPY,
    title: t('common.makeACopy'),
  },
  {
    key: QUICK_SEARCH_TOOLS.MOVE_DOCUMENT,
    title: t('viewer.quickSearch.otherTools.moveDocument'),
  },
  {
    key: QUICK_SEARCH_TOOLS.DOWNLOAD,
    title: t('action.download'),
  },
  {
    key: QUICK_SEARCH_TOOLS.AUTO_SYNC,
    title: 'Auto-sync',
  },
  {
    key: QUICK_SEARCH_TOOLS.DARK_MODE,
    title: isLightMode ? t('common.darkMode') : t('common.lightMode'),
  },
  {
    key: QUICK_SEARCH_TOOLS.FULL_SCREEN,
    title: t('viewer.fullScreen'),
  },
  {
    key: QUICK_SEARCH_TOOLS.PRESENTER_MODE,
    title: t('action.presenterMode'),
  },
  {
    key: QUICK_SEARCH_TOOLS.FILE_INFO,
    title: t('common.fileInfomation'),
  },
  {
    key: QUICK_SEARCH_TOOLS.VERSION_HISTORY,
    title: t('viewer.revision.historyTitle'),
  },
];

export const getFileMenuTools = ({ t, isLightMode }: { t: TFunction; isLightMode: boolean }): QuickSearchToolType[] => {
  const fileMenuTools = getFileMenuToolsConfiguration({ t, isLightMode });

  return fileMenuTools.map(({ key, title }) => ({
    key,
    title,
    element: <FileMenu menuItemKey={key} />,
  }));
};
