import { ToolName } from './type';

/**
 * https://www.pdftron.com/api/web/CoreControls.DocumentViewer.html#getTool__anchor
 */
export default (docViewer: Core.DocumentViewer, toolName: ToolName): Core.Tools.Tool => docViewer.getTool(toolName);
