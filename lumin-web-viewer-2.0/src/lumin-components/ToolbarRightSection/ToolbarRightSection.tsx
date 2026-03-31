import React from 'react';

import { LEFT_SIDE_BAR } from '@new-ui/components/LuminLeftSideBar/constants';
import ToolbarItem from '@new-ui/components/LuminToolbar/components/ToolbarItem';
import { ToolType } from '@new-ui/components/LuminToolbar/components/ToolbarList';
import ToolbarProvider from '@new-ui/components/LuminToolbar/components/ToolbarProvider';

import { useGetRightSectionTools } from './hooks/useGetRightSectionTools';

interface ToolbarRightSectionProps {
  isInReadAloudMode: boolean;
  readAloudSection: React.ReactNode;
}

const ToolbarRightSection = ({ isInReadAloudMode, readAloudSection }: ToolbarRightSectionProps) => {
  const { tools, toolbarValue, requestAccessModalElement } = useGetRightSectionTools();

  const toolbarItems = (): React.ReactElement[] =>
    tools.map((tool: ToolType, index) => (
      <ToolbarItem key={`${tool.key}${index}`} order={tool.order}>
        {tool.element}
      </ToolbarItem>
    ));

  return (
    <>
      <ToolbarProvider
        key={toolbarValue}
        numberOfToolsItem={tools.filter((tool) => tool.order !== null).length}
        toolName={toolbarValue}
        isInReadAloudMode={isInReadAloudMode}
      >
        {isInReadAloudMode ? readAloudSection : toolbarItems()}
      </ToolbarProvider>
      {toolbarValue === LEFT_SIDE_BAR.PAGE_TOOLS && requestAccessModalElement}
    </>
  );
};

export default ToolbarRightSection;
