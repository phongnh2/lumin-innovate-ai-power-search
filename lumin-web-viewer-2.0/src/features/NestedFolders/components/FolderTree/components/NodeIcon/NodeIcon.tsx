import { Icomoon, IcomoonProps } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';

type NodeIconProps = {
  isFolder: boolean;
  disabled?: boolean;
  className?: string;
};

const NodeIcon = ({ isFolder, disabled, className }: NodeIconProps) => {
  const iconProps: IcomoonProps = useMemo(
    () =>
      isFolder
        ? {
            size: 'lg',
            type: 'folder-shape-lg',
            color: 'var(--kiwi-colors-surface-outline)',
          }
        : {
            size: 'lg',
            type: 'ph-file-text-fill',
            color: 'var(--kiwi-colors-surface-outline)',
          },
    [isFolder]
  );

  return <Icomoon {...iconProps} className={className} data-disabled={Boolean(disabled)} />;
};

export default React.memo(NodeIcon);
