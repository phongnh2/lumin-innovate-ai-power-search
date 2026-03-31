import { TFunction } from 'i18next';
import React from 'react';

import * as Tool from '@new-ui/components/LuminToolbar/tools-components';

import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolElementProps, QuickSearchToolType } from 'features/QuickSearch/types';

export const getEditPdfTools = (t: TFunction): QuickSearchToolType[] => [
  {
    key: QUICK_SEARCH_TOOLS.EDIT_CONTENT,
    title: t('viewer.quickSearch.editPdfTools.editContent'),
    element: (props: QuickSearchToolElementProps) => <Tool.EditPdfMenuTool {...props} />,
  },
];
