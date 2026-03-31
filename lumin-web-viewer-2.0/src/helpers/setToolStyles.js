import core from 'core';

export const MEASUREMENT_TOOL_NAMES = [
  window.Core.Tools.ToolNames.DISTANCE_MEASUREMENT,
  window.Core.Tools.ToolNames.PERIMETER_MEASUREMENT,
  window.Core.Tools.ToolNames.AREA_MEASUREMENT,
  window.Core.Tools.ToolNames.RECTANGULAR_AREA_MEASUREMENT,
  window.Core.Tools.ToolNames.ELLIPSE_MEASUREMENT,
];

export default (toolName, property, value) => {
  let tools = [];

  // Don't want to keep color or opacity in sync.
  if (MEASUREMENT_TOOL_NAMES.includes(toolName) && !(property === 'StrokeColor' || property === 'Opacity')) {
    // currently we want to keep the styles of measurement tools sync
    tools = MEASUREMENT_TOOL_NAMES.map(core.getTool);
  } else {
    const tool = core.getTool(toolName);
    if (tool) {
      tools.push(tool);
    }
  }

  tools.forEach((tool) => {
    tool.setStyles({
      [property]: value,
    });
  });
};
