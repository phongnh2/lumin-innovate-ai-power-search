import { TFunction } from 'i18next';
import React from 'react';

import * as Tool from '@new-ui/components/LuminToolbar/tools-components';

import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';

import { QUICK_SEARCH_TOOLS } from 'features/QuickSearch/constants';
import { QuickSearchToolType } from 'features/QuickSearch/types';

interface PageToolWithPermissionProps {
  withEditPermission: () => void;
}

const PageToolWithPermission: React.FC<{
  children: (props: PageToolWithPermissionProps) => React.ReactElement;
}> = ({ children }) => {
  const { withEditPermission } = useRequestPermissionChecker({
    permissionRequest: RequestType.EDITOR,
  });

  return children({ withEditPermission });
};

const getPageToolsConfiguration = (t: TFunction) =>
  [
    {
      key: QUICK_SEARCH_TOOLS.MERGE_DOCS,
      component: Tool.MergeTool,
      title: t('viewer.quickSearch.pageTools.merge'),
    },
    {
      key: QUICK_SEARCH_TOOLS.SPLIT_EXTRACT,
      component: Tool.SplitTool,
      title: t('generalLayout.toolbar.splitNExtract'),
    },
    {
      key: QUICK_SEARCH_TOOLS.ROTATE_PAGES,
      component: Tool.RotateTool,
      title: t('viewer.quickSearch.pageTools.rotate'),
    },
    {
      key: QUICK_SEARCH_TOOLS.DELETE_PAGES,
      component: Tool.DeleteTool,
      title: t('viewer.quickSearch.pageTools.delete'),
    },
    {
      key: QUICK_SEARCH_TOOLS.MOVE_PAGES,
      component: Tool.MovePageTool,
      title: t('viewer.quickSearch.pageTools.move'),
    },
    {
      key: QUICK_SEARCH_TOOLS.INSERT_BLANK_PAGES,
      component: Tool.InsertTool,
      title: t('viewer.quickSearch.pageTools.insert'),
    },
    { key: QUICK_SEARCH_TOOLS.CROP_PAGES, component: Tool.CropTool, title: t('viewer.quickSearch.pageTools.crop') },
    { key: QUICK_SEARCH_TOOLS.PERFORM_OCR, component: Tool.OcrTool, title: t('viewer.quickSearch.pageTools.ocr') },
  ] as const;

export const getPageTools = (t: TFunction): QuickSearchToolType[] => {
  const pageTools = getPageToolsConfiguration(t);

  return pageTools.map(({ key, component: Component, title }) => ({
    key,
    title,
    element: (
      <PageToolWithPermission>
        {(props: PageToolWithPermissionProps) => <Component {...props} />}
      </PageToolWithPermission>
    ),
  }));
};
