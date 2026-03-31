import { ZoomTypes } from '@new-ui/components/PageNavigation/hook/useZoomDocument';

import core from 'core';

import {
  ZOOM_THRESHOLD,
  getMinZoomLevel,
  getMaxZoomLevel,
  stepToWheelFactorRangesMap,
  stepToZoomFactorRangesMap,
} from 'constants/zoomFactors';

export const getWheelStep = (currentZoomFactor: number) => {
  const steps = Object.keys(stepToWheelFactorRangesMap);

  const found = steps.find((stepKey) => {
    const [min, max] = stepToWheelFactorRangesMap[stepKey];
    return currentZoomFactor >= min && (max === null || currentZoomFactor <= max);
  });

  return found ? parseFloat(found) : 0.02;
};

export const getZoomStep = (currentZoomFactor: number) => {
  const steps = Object.keys(stepToZoomFactorRangesMap);
  const found = steps.find((stepKey) => {
    const [min, max] = stepToZoomFactorRangesMap[stepKey];
    return currentZoomFactor >= min && (max === null || currentZoomFactor <= max);
  });
  return found ?? 0.075;
};

export const zoomIn = () => {
  const currentZoomFactor = core.getZoom();
  if (currentZoomFactor === ZOOM_THRESHOLD.MAX) {
    return;
  }

  const step = getWheelStep(currentZoomFactor);

  const newZoomFactor = currentZoomFactor + Number(step);
  core.setZoomLevel(Math.min(newZoomFactor, getMaxZoomLevel()));
};

export const zoomOut = () => {
  const currentZoomFactor = core.getZoom();
  if (currentZoomFactor === ZOOM_THRESHOLD.MIN) {
    return;
  }

  const step = getWheelStep(currentZoomFactor);

  const newZoomFactor = currentZoomFactor - Number(step);
  core.setZoomLevel(Math.max(newZoomFactor, getMinZoomLevel()));
};

export const onZoomByAction = (action: ZoomTypes): void => {
  switch (action) {
    case ZoomTypes.ZOOM_IN: {
      zoomIn();
      break;
    }
    case ZoomTypes.ZOOM_OUT: {
      zoomOut();
      break;
    }
    default:
      break;
  }
};
