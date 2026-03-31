import { ArrowUUpLeftIcon } from '@luminpdf/icons/dist/csr/ArrowUUpLeft';
import { ArrowUUpRightIcon } from '@luminpdf/icons/dist/csr/ArrowUUpRight';
import { CursorIcon } from '@luminpdf/icons/dist/csr/Cursor';
import { HandIcon } from '@luminpdf/icons/dist/csr/Hand';
import { TFunction } from 'i18next';
import React from 'react';

import { LEFT_PANEL_VALUES } from '@new-ui/components/LuminLeftPanel/constants';
import { LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import LeftPanelTool from '@new-ui/components/LuminToolbar/tools-components/LeftPanelTool';
import GridViewTool from '@new-ui/components/LuminToolbar/tools-components/page-tools/GridViewTool';
import SingleViewTool from '@new-ui/components/LuminToolbar/tools-components/page-tools/SingleViewTool';
import ViewControlMenuItem from '@new-ui/components/LuminToolbar/tools-components/ViewControlTool/ViewControlMenuItem';
import SelectionToolMenuItem from '@new-ui/components/SelectionToolMenuItem';
import UndoRedoMenuItem from '@new-ui/components/UndoRedoMenuItem';

import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { LEFT_TOOLBAR_TOOLS } from 'features/QuickSearch/constants/leftToolbarTools';
import ReadAloudMenuItem from 'features/ReadAloud/components/ReadAloudMenuItem';

import { DataElements } from 'constants/dataElement';
import { TOOLS_NAME } from 'constants/toolsName';

const LEFT_PANEL_TOOLS = [
  {
    menuItemKey: LEFT_PANEL_VALUES.THUMBNAIL,
    i18nKey: 'viewer.viewerLeftPanel.thumbnails',
    quickSearchKey: QUICK_SEARCH_TOOLS.THUMBNAILS,
  },
  {
    menuItemKey: LEFT_PANEL_VALUES.OUTLINE,
    i18nKey: 'viewer.viewerLeftPanel.outlines',
    quickSearchKey: QUICK_SEARCH_TOOLS.OUTLINES,
  },
];

const SELECTION_TOOLS = [
  {
    quickSearchKey: QUICK_SEARCH_TOOLS.SELECT,
    toolName: TOOLS_NAME.EDIT,
    i18nKey: 'tool.select',
    icon: <CursorIcon size={24} />,
  },
  {
    quickSearchKey: QUICK_SEARCH_TOOLS.PAN,
    toolName: TOOLS_NAME.PAN,
    i18nKey: 'tool.pan',
    icon: <HandIcon size={24} />,
  },
];

const UNDO_REDO_TOOLS = [
  {
    quickSearchKey: QUICK_SEARCH_TOOLS.UNDO,
    i18nKey: 'annotation.undo',
    elementName: DataElements.UNDO_BUTTON,
    icon: <ArrowUUpLeftIcon size={24} />,
    shortcutKey: LEFT_TOOLBAR_TOOLS.UNDO,
  },
  {
    quickSearchKey: QUICK_SEARCH_TOOLS.REDO,
    i18nKey: 'annotation.redo',
    elementName: DataElements.REDO_BUTTON,
    icon: <ArrowUUpRightIcon size={24} />,
    shortcutKey: LEFT_TOOLBAR_TOOLS.REDO,
  },
];

const getViewControlTools = ({ t, toolbarValue }: { t: TFunction; toolbarValue: string }) => {
  if (toolbarValue !== LEFT_SIDE_BAR_VALUES.PAGE_TOOLS.value) {
    return [
      {
        key: QUICK_SEARCH_TOOLS.VIEW_CONTROL,
        title: t('component.viewControlsOverlay'),
        element: <ViewControlMenuItem />,
      },
    ];
  }

  return [
    {
      key: QUICK_SEARCH_TOOLS.GRID_VIEW,
      title: t('viewer.gridView'),
      element: <GridViewTool renderAsMenuItem />,
    },
    {
      key: QUICK_SEARCH_TOOLS.SINGLE_VIEW,
      title: t('viewer.singleView'),
      element: <SingleViewTool renderAsMenuItem />,
    },
  ];
};

export const getLeftToolbarTools = ({ t, toolbarValue }: { t: TFunction; toolbarValue: string }) => [
  ...getViewControlTools({ t, toolbarValue }),
  ...LEFT_PANEL_TOOLS.map(({ quickSearchKey, menuItemKey, i18nKey }) => ({
    title: t(i18nKey),
    key: quickSearchKey,
    element: <LeftPanelTool renderOptions={{ renderAsMenuItem: true, menuItemKey }} />,
  })),
  {
    key: QUICK_SEARCH_TOOLS.READ_ALOUD,
    title: t('viewer.readAloud.readAloud'),
    element: <ReadAloudMenuItem />,
  },
  ...SELECTION_TOOLS.map(({ quickSearchKey, toolName, i18nKey, icon }) => ({
    key: quickSearchKey,
    title: t(i18nKey),
    element: <SelectionToolMenuItem toolName={toolName} icon={icon} i18nKey={i18nKey} />,
  })),
  ...UNDO_REDO_TOOLS.map(({ quickSearchKey, i18nKey, elementName, icon, shortcutKey }) => ({
    key: quickSearchKey,
    title: t(i18nKey),
    element: <UndoRedoMenuItem elementName={elementName} icon={icon} i18nKey={i18nKey} shortcutKey={shortcutKey} />,
  })),
];
