import React from 'react';

type StopPropagationEvents =
  | 'onClick'
  | 'onDoubleClick'
  | 'onContextMenu'
  | 'onMouseDown'
  | 'onMouseUp'
  | 'onPointerDown'
  | 'onPointerUp';

const DEFAULT_EVENTS: StopPropagationEvents[] = ['onClick', 'onDoubleClick', 'onContextMenu'];

export interface StopPropagationProps extends React.HTMLAttributes<HTMLDivElement> {
  events?: StopPropagationEvents[];
}
const StopPropagation = React.forwardRef<HTMLDivElement, StopPropagationProps>((props, ref) => {
  const { children, events = DEFAULT_EVENTS, ...rest } = props;

  const { onClick, onDoubleClick, onContextMenu, onMouseDown, onMouseUp, onPointerDown, onPointerUp, ...restProps } =
    rest;

  const getHandler = <EventName extends StopPropagationEvents>(
    eventName: EventName,
    handler: React.ComponentProps<'div'>[EventName]
  ) => {
    if (events.includes(eventName)) {
      return (event: React.SyntheticEvent) => {
        event.stopPropagation();
        handler?.(event as unknown as React.PointerEvent<HTMLDivElement>);
      };
    }
    return handler;
  };

  return (
    <div
      ref={ref}
      role="presentation"
      onClick={getHandler('onClick', onClick)}
      onDoubleClick={getHandler('onDoubleClick', onDoubleClick)}
      onContextMenu={getHandler('onContextMenu', onContextMenu)}
      onMouseDown={getHandler('onMouseDown', onMouseDown)}
      onMouseUp={getHandler('onMouseUp', onMouseUp)}
      onPointerDown={getHandler('onPointerDown', onPointerDown)}
      onPointerUp={getHandler('onPointerUp', onPointerUp)}
      {...restProps}
    >
      {children}
    </div>
  );
});

StopPropagation.displayName = 'StopPropagation';

export default StopPropagation;
