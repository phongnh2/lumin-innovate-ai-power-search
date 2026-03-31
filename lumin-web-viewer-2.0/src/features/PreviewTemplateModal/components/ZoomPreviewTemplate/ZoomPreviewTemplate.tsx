import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import React, { useRef } from 'react';

import { ZoomTypes } from '@new-ui/components/PageNavigation/hook/useZoomDocument';

import { ZOOM_THRESHOLD } from 'constants/zoomFactors';

import styles from './ZoomPreviewTemplate.module.scss';

const ZoomPreviewTemplate = ({
  zoomLevel,
  onZoomAction,
  isLoading,
}: {
  zoomLevel: number;
  onZoomAction: (action: ZoomTypes) => void;
  isLoading: boolean;
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (action: ZoomTypes) => {
    onZoomAction(action);

    intervalRef.current = setInterval(() => {
      onZoomAction(action);
    }, 100);
  };

  const handleMouseUp = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className={styles.zoomWrapper}>
      <IconButton
        size="md"
        icon="ph-minus"
        disabled={zoomLevel <= ZOOM_THRESHOLD.MIN || isLoading}
        onMouseDown={() => handleMouseDown(ZoomTypes.ZOOM_OUT)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <Text size="sm" type="body">
        {zoomLevel}%
      </Text>
      <IconButton
        size="md"
        icon="ph-plus"
        disabled={zoomLevel >= ZOOM_THRESHOLD.MAX || isLoading}
        onMouseDown={() => handleMouseDown(ZoomTypes.ZOOM_IN)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default ZoomPreviewTemplate;
