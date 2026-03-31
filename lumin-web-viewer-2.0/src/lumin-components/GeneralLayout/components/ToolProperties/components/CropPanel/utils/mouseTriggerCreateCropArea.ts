import core from 'core';

export type Point = { x: number; y: number };

interface MouseTriggerCreateCropAreaParams {
  cropCreateTool: Core.Tools.CropCreateTool;
  pageNumber: number;
  startPoint: Point;
  endPoint: Point;
}

const createMouseEvent = (type: string, clientX: number, clientY: number) =>
  new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button: 0,
  });

export function mouseTriggerCreateCropArea(props: MouseTriggerCreateCropAreaParams) {
  const { cropCreateTool, pageNumber, startPoint, endPoint } = props;
  const displayMode = core.getDisplayModeObject();

  const startPointWindow = displayMode.pageToWindow(startPoint, pageNumber) as Point;
  const endPointWindow = displayMode.pageToWindow(endPoint, pageNumber) as Point;

  // mouse down event (start)
  const mouseDownEvent = createMouseEvent('mousedown', startPointWindow.x, startPointWindow.y);
  cropCreateTool.mouseLeftDown(mouseDownEvent);

  // mouse move events (drag)
  const moveSteps = 8;
  for (let i = 1; i <= moveSteps; i++) {
    const cx = Math.round(startPointWindow.x + (endPointWindow.x - startPointWindow.x) * (i / moveSteps));
    const cy = Math.round(startPointWindow.y + (endPointWindow.y - startPointWindow.y) * (i / moveSteps));
    const mouseMoveEvent = createMouseEvent('mousemove', cx, cy);
    cropCreateTool.mouseMove(mouseMoveEvent);
  }

  // mouse up event (drop)
  const mouseUpEvent = createMouseEvent('mouseup', endPointWindow.x, endPointWindow.y);
  cropCreateTool.mouseLeftUp(mouseUpEvent);
}
