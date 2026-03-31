import core from 'core';

import { getToolStyles } from 'features/Annotation/utils/getToolStyles';

const isKeyColorProperty = (key) =>
  ['TextColor', 'StrokeColor', 'FillColor'].includes(key);

export const getParsedToolStyles = (toolStyles) =>
  JSON.parse(toolStyles, (_, styles) => {
    if (styles) {
      Object.entries(styles).forEach(([key, style]) => {
        if (isKeyColorProperty(key) && typeof style === 'object') {
          styles[key] = new window.Core.Annotations.Color(style.R, style.G, style.B, style.A);
        }
      });
    }
    return styles;
  });

const setDefaultToolStyles = () => {
  const toolModeMap = core.getToolModeMap();

  Object.keys(toolModeMap).forEach((toolName) => {
    const toolStyles = getToolStyles(toolName);

    if (toolStyles) {
      const tool = toolModeMap[toolName];

      const parsedToolStyles = getParsedToolStyles(toolStyles);
      tool.setStyles(parsedToolStyles);
    }
  });
};

export default setDefaultToolStyles;
