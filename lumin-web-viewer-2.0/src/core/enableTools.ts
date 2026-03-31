/**
 * Enable multiple tools.
 * @method WebViewerInstance#enableTools
 * @param {Array.<string>} [toolNames=all tools] Array of name of the tools, either from tool names list or the name you registered your custom tool with. If nothing is passed, all tools will be enabled.
 * @example
WebViewer(...)
  .then(function(instance) {
    // enable sticky annotation tool and free text tool
    instance.enableTools([ 'AnnotationCreateSticky', 'AnnotationCreateFreeText' ]);
  });
 */
import { Store } from 'redux';

import createToolAPI from 'helpers/createToolAPI';

import { ToolName } from './type';

const enable = true;
export default (toolArray: ToolName[], store: Store): void => createToolAPI(enable, toolArray, store);
