import React from 'react';

import SingleButton from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';
import SplitButton from 'lumin-components/ViewerCommonV2/ToolButton/SplitButton';

import ToolbarRightSectionMenuItem from './components/ToolbarRightSectionMenuItem';

interface ToolbarRightSectionItemProps {
  toolName?: string;
  buttonProps: object;
  isSingleButton: boolean;
  renderAsMenuItem: boolean;
}

const ToolbarRightSectionItem = ({
  toolName,
  buttonProps,
  isSingleButton,
  renderAsMenuItem,
}: ToolbarRightSectionItemProps) => {
  if (renderAsMenuItem) {
    return (
      <ToolbarRightSectionMenuItem
        toolName={toolName}
        {...buttonProps}
        {...(isSingleButton ? { singleButtonProps: buttonProps } : {})}
      />
    );
  }
  const ToolbarButton = isSingleButton ? SingleButton : SplitButton;
  return <ToolbarButton {...buttonProps} />;
};

export default ToolbarRightSectionItem;
