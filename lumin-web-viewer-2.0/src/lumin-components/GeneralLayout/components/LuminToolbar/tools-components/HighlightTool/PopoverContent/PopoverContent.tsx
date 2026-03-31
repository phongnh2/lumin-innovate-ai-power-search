import React from 'react';

import Menu from '@new-ui/general-components/Menu';

import FreeHandHighlightStylePalette from './FreeHandHighlightStylePalette';
import { IPopoverContentProps } from './PopoverContent.interface';
import TextHightlightStylePalette from './TextHightlightStylePalette';

const PopoverContent = (props: IPopoverContentProps): JSX.Element => {
  const renderMenuItems = () => (
    <>
      <TextHightlightStylePalette {...props} />
      <FreeHandHighlightStylePalette {...props} />
    </>
  );

  if (props.isNavigationTabPopover) {
    return renderMenuItems();
  }
  return <Menu alignMenuItems="top">{renderMenuItems()}</Menu>;
};

export default PopoverContent;
