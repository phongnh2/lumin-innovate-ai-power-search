import { MenuItem } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import { useNetworkStatus } from 'hooks/useNetworkStatus';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';
import { useToolLabels } from 'features/QuickSearch/hooks/useToolLabels';

type MoveItemProps = {
  onClick: () => void;
  disabled?: boolean;
};

const MoveItem = ({ onClick, disabled }: MoveItemProps) => {
  const { isOffline } = useNetworkStatus();
  const { getToolLabel } = useToolLabels();
  const { isTemplateViewer } = useTemplateViewerMatch();

  if (disabled || isTemplateViewer) {
    return null;
  }
  return (
    <MenuItem
      size="dense"
      leftSection={<Icomoon className="md_move-1" size={24} />}
      onClick={onClick}
      disabled={isOffline}
    >
      {getToolLabel('common.move', 'viewer.quickSearch.otherTools.moveDocument')}
    </MenuItem>
  );
};

export default MoveItem;
