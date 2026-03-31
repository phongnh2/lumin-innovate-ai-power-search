/**
 * Type for ClickAwayListener mouseEvent
 * [ClickAwayListener API](https://mui.com/base-ui/react-click-away-listener/components-api/#click-away-listener)
 */
export const ClickAwayMouseEvent = {
  ON_CLICK: 'onClick',
  ON_MOUSE_DOWN: 'onMouseDown',
  ON_MOUSE_UP: 'onMouseUp',
  ON_POINTER_DOWN: 'onPointerDown',
  ON_POINTER_UP: 'onPointerUp',
} as const;

export type TClickAwayMouseEvent = typeof ClickAwayMouseEvent[keyof typeof ClickAwayMouseEvent];

export const ClickAwayTouchEvent = {
  ON_TOUCH_END: 'onTouchEnd',
  ON_TOUCH_START: 'onTouchStart',
} as const;

export type TClickAwayTouchEvent = typeof ClickAwayTouchEvent[keyof typeof ClickAwayTouchEvent];
