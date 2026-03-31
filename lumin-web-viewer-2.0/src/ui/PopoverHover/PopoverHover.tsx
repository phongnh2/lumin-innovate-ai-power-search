import { useDisclosure } from '@mantine/hooks';
import { Popover, PopoverTarget, PopoverDropdown, PopoverProps } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';

import { useCleanup } from 'hooks/useCleanup';

type PopoverHoverProps = Omit<PopoverProps, 'opened'> & {
  renderTarget: (props: { open: () => void; close: () => void; isOpen: boolean }) => React.ReactNode;
  renderContent: (props: { close: () => void }) => React.ReactNode;
  /**
   * @description Delay in ms before opening the popover
   */
  openDelay?: number;
  /**
   * @description Delay in ms before closing the popover
   */
  closeDelay?: number;
};

const PopoverHover = (props: PopoverHoverProps) => {
  const { renderTarget, renderContent, openDelay = 0, closeDelay = 0, ...otherProps } = props;

  const [isOpen, { open: openImmediate, close: closeImmediate }] = useDisclosure(false);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useCleanup(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  }, []);

  const open = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (isOpen || openTimeoutRef.current) {
      return;
    }

    if (openDelay <= 0) {
      openImmediate();
      return;
    }

    openTimeoutRef.current = setTimeout(() => {
      openImmediate();
      openTimeoutRef.current = null;
    }, openDelay);
  };

  const close = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    if (!isOpen || closeTimeoutRef.current) {
      return;
    }

    if (closeDelay <= 0) {
      closeImmediate();
      return;
    }

    closeTimeoutRef.current = setTimeout(() => {
      closeImmediate();
      closeTimeoutRef.current = null;
    }, closeDelay);
  };

  return (
    <Popover {...otherProps} opened={isOpen} withinPortal={false} onDismiss={closeImmediate}>
      <PopoverTarget>
        <div onMouseEnter={open} onMouseLeave={close}>
          {renderTarget({
            open,
            close,
            isOpen,
          })}
        </div>
      </PopoverTarget>
      <PopoverDropdown onMouseEnter={open} onMouseLeave={close}>
        {renderContent({ close })}
      </PopoverDropdown>
    </Popover>
  );
};

export default PopoverHover;
