import { useEffect, useState } from 'react';

import { ZoomTypes } from '@new-ui/components/PageNavigation/hook/useZoomDocument';

import core from 'core';

import { ZOOM_THRESHOLD } from 'constants/zoomFactors';

import { getWheelStep, onZoomByAction } from '../helpers/zoom';

const useZoomPage = (documentElement?: HTMLDivElement) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    if (!documentElement) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) {
        return;
      }
      e.preventDefault();

      setZoomLevel((prevZoom) => {
        const currentZoomFactor = prevZoom / 100;
        const wheelStep = getWheelStep(currentZoomFactor);
        const direction = e.deltaY > 0 ? 'out' : 'in';
        const stepPercent = wheelStep * 100;

        let newZoom = prevZoom;
        if (direction === 'in') {
          newZoom = Math.min(prevZoom + stepPercent, ZOOM_THRESHOLD.MAX);
        } else {
          newZoom = Math.max(prevZoom - stepPercent, ZOOM_THRESHOLD.MIN);
        }

        core.setZoomLevel(newZoom / 100);
        return newZoom;
      });
    };

    documentElement.addEventListener('wheel', handleWheel, { passive: false });
    // eslint-disable-next-line consistent-return
    return () => {
      documentElement.removeEventListener('wheel', handleWheel);
    };
  }, [documentElement]);

  const onZoomAction = (action: ZoomTypes) => {
    onZoomByAction(action);
    setZoomLevel(Math.round(core.getZoom() * 100));
  };

  return { zoomLevel, setZoomLevel, onZoomAction };
};

export default useZoomPage;
