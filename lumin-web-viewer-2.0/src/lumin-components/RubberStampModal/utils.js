import dayjs from 'dayjs';

import core from 'core';

import TOOLS_NAME from 'constants/toolsName';

export const drawInCanvas = (_parameters, canvas, canvasParent) => {
  const rubberStampTool = core.getTool(TOOLS_NAME.RUBBER_STAMP);
  const parameters = {
    canvas,
    canvasParent,
    width: 164,
    height: 56,
    ..._parameters,
  };

  rubberStampTool.drawCustomStamp(parameters);
  canvas.toDataURL();
};

export const generateSubtitle = (head, body, tail) => {
  const generateDateTimeString = (dateOrTime) => (dateOrTime ? `[${dayjs().format(dateOrTime)}]` : '');
  const getHead = (head) => {
    const propperHead = `[${head}]`;
    return head ? propperHead : '';
  };
  return `${getHead(head)} ${generateDateTimeString(body)} ${generateDateTimeString(tail)}`.trim();
};