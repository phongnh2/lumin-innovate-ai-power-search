import { useEffect } from 'react';
import { v4 } from 'uuid';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import { CUSTOM_EVENT } from 'constants/customEvent';

type UseOutlineUpdatedProps = {
  handleSyncFile: (actionId: string) => void;
  enabled: boolean;
};

export const useOutlineUpdated = ({ handleSyncFile, enabled }: UseOutlineUpdatedProps) => {
  const handleOutlineChanged = () => {
    const id = v4();
    const actionId = `${AUTO_SYNC_CHANGE_TYPE.CONTENT_CHANGE}:${id}`;
    handleSyncFile(actionId);
  };

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    window.addEventListener(CUSTOM_EVENT.OUTLINE_CHANGED, handleOutlineChanged);

    return () => {
      window.removeEventListener(CUSTOM_EVENT.OUTLINE_CHANGED, handleOutlineChanged);
    };
  }, [enabled]);
};
