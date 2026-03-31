/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#getToolModeMap__anchor
 */

type Keys = keyof typeof Core.Tools.ToolNames;

export default (docViewer: Core.DocumentViewer): Record<typeof Core.Tools.ToolNames[Keys], Core.Tools.Tool> =>
  docViewer.getToolModeMap() as Record<typeof Core.Tools.ToolNames[Keys], Core.Tools.Tool>;
