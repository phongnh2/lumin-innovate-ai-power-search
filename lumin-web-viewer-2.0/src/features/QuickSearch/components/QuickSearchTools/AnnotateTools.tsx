import { TFunction } from 'i18next';
import React from 'react';

import * as Tool from '@new-ui/components/LuminToolbar/tools-components';

import MeasureTool from 'features/MeasureTool/components/MeasureTool';
import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

import { TOOLS_NAME } from 'constants/toolsName';

export const getAnnotateTools = (t: TFunction): QuickSearchToolType[] => [
  {
    key: QUICK_SEARCH_TOOLS.ADD_COMMENT,
    title: t('action.addComment'),
    element: <Tool.CommentTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.MEASURE,
    title: t('viewer.measureTool.measure'),
    element: <MeasureTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.TYPE,
    title: t('action.type'),
    element: <Tool.FreeTextTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.FREEHAND_HIGHLIGHT,
    title: t('annotation.freehandHighlight'),
    element: <Tool.HighlightTool type={TOOLS_NAME.FREEHAND_HIGHLIGHT} />,
  },
  {
    key: QUICK_SEARCH_TOOLS.TEXT_HIGHLIGHT,
    title: t('annotation.highlight'),
    element: <Tool.HighlightTool type={TOOLS_NAME.HIGHLIGHT} />,
  },
  {
    key: QUICK_SEARCH_TOOLS.TEXT_TOOLS,
    title: t('component.textToolsButton'),
    element: <Tool.TextTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.SHAPE,
    title: t('documentPage.shape'),
    element: <Tool.ShapeTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.ERASER,
    title: t('annotation.eraser'),
    element: <Tool.EraserTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.IMAGE,
    title: t('annotation.image'),
    element: <Tool.ImageTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.DRAW,
    title: t('action.draw'),
    element: <Tool.FreeHandTool />,
  },
];
