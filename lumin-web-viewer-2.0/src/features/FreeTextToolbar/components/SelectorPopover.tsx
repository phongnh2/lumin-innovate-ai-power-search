import { Button, PlainTooltip, Popover, PopoverDropdown, PopoverTarget } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { SelectorPopoverProps } from 'features/FreeTextToolbar/types';

const SelectorPopover = ({ isOpen, trigger, content, width = 304, triggerProps, onToggle }: SelectorPopoverProps) => (
  <Popover opened={isOpen} position="bottom-start" width={width} onChange={onToggle}>
    <PopoverTarget>
      <PlainTooltip position="bottom" content={triggerProps.tooltip}>
        <Button type="button" size="sm" variant="text" {...triggerProps.buttonProps} onClick={onToggle}>
          {trigger}
        </Button>
      </PlainTooltip>
    </PopoverTarget>
    <PopoverDropdown>{content}</PopoverDropdown>
  </Popover>
);

export default SelectorPopover;
