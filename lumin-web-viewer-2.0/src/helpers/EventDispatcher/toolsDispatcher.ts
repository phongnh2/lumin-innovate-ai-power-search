import fireEvent from 'helpers/fireEvent';

import { CustomEventNames } from './customEventNames';

export class ToolsDispatcher {
  static openTool() {
    return {
      dispatcher: (toolName: string) => {
        fireEvent(CustomEventNames.OpenTool, { toolName });
      },
      listener: (callback: (event: CustomEvent) => void) => {
        window.addEventListener(CustomEventNames.OpenTool, callback as EventListener);
      },
      removeListener: (callback: (event: CustomEvent) => void) => {
        window.removeEventListener(CustomEventNames.OpenTool, callback as EventListener);
      },
    };
  }
}
