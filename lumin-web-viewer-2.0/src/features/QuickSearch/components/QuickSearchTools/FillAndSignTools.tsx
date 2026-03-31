import { TFunction } from 'i18next';
import React from 'react';

import * as Tool from '@new-ui/components/LuminToolbar/tools-components';
import { FORM_BUILDER_TOOL_ITEM } from '@new-ui/components/LuminToolbar/tools-components/FormBuilderTool/constants';

import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

export const getFillAndSignTools = (t: TFunction): QuickSearchToolType[] => [
  {
    key: QUICK_SEARCH_TOOLS.SIGNATURE,
    title: t('annotation.signature'),
    element: <Tool.SignatureTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.DATE,
    title: t('annotation.date'),
    element: <Tool.DateStampTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.STAMP,
    title: t('annotation.stamp'),
    element: <Tool.RubberStampTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.DOT,
    title: t('annotation.dot'),
    element: <Tool.DotStampTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.TICK,
    title: t('annotation.tick'),
    element: <Tool.TickStampTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.CROSS,
    title: t('annotation.cross'),
    element: <Tool.CrossStampTool />,
  },
  {
    key: QUICK_SEARCH_TOOLS.CUSTOMIZE_FIELDS,
    title: t('viewer.formFieldDetection.toolMenu.customizeFields'),
    element: <Tool.FormBuilderToolContainer specificTool={FORM_BUILDER_TOOL_ITEM.CUSTOMIZE} />,
  },
  {
    key: QUICK_SEARCH_TOOLS.AUTO_DETECT_FIELDS,
    title: t('viewer.formFieldDetection.toolMenu.aiAutoDetect'),
    element: <Tool.FormBuilderToolContainer specificTool={FORM_BUILDER_TOOL_ITEM.AUTO_DETECT} />,
  },
];
