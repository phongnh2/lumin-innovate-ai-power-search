import { RefObject, useEffect } from 'react';

import { ToolsDispatcher } from 'helpers/EventDispatcher';

import { TOOLS_NAME } from 'constants/toolsName';

export const useOpenToolListener = (openCallbackRef: RefObject<() => void>) => {
  useEffect(() => {
    const onOpenTool = (event: CustomEvent<{ toolName: string }>) => {
      if (event.detail.toolName === TOOLS_NAME.SIGNATURE) {
        openCallbackRef.current();
      }
    };

    ToolsDispatcher.openTool().listener(onOpenTool);
    return () => {
      ToolsDispatcher.openTool().removeListener(onOpenTool);
    };
  }, [openCallbackRef]);
};
