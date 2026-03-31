import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';
import {
  AnnotationTools,
  FillAndSignTools,
  getPageTools,
  PopularTools,
  SecurityTools,
  ToolType,
} from '@new-ui/components/LuminToolbar/components/ToolbarList';

import selectors from 'selectors';

import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';

export const useGetRightSectionTools = (hoveredToolbarValue?: string) => {

  const toolbarValue = useSelector(selectors.toolbarValue) as keyof typeof LEFT_SIDE_BAR;

  const { requestAccessModalElement, withEditPermission } = useRequestPermissionChecker({
    permissionRequest: RequestType.EDITOR,
  });

  const tools = useMemo((): ToolType[] => {
    const tool = hoveredToolbarValue || toolbarValue;
    switch (tool) {
      case LEFT_SIDE_BAR.POPULAR: {
        return PopularTools;
      }
      case LEFT_SIDE_BAR.ANNOTATION: {
        return AnnotationTools;
      }
      case LEFT_SIDE_BAR.FILL_AND_SIGN: {
        return FillAndSignTools;
      }
      case LEFT_SIDE_BAR.SECURITY: {
        return SecurityTools;
      }
      case LEFT_SIDE_BAR.PAGE_TOOLS: {
        return getPageTools(withEditPermission);
      }
      default: {
        return [];
      }
    }
  }, [hoveredToolbarValue, toolbarValue, withEditPermission]);

  const menuTools = useMemo((): ToolType[] => {
    const formBuilderAndSignSendTools = tools.filter((tool) => ['form_builder', 'sign_send'].includes(tool.key));

    const reversedTools = tools.slice().reverse();
    const filteredTools = reversedTools.filter((tool) => !['form_builder', 'sign_send', 'divider'].includes(tool.key));

    return [...filteredTools, ...formBuilderAndSignSendTools];
  }, [tools]);

  return { tools, menuTools, toolbarValue, requestAccessModalElement };
};
