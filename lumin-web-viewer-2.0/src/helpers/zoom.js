import clamp from 'lodash/clamp';

import core from 'core';

import { stepToZoomFactorRangesMap, getMaxZoomLevel, getMinZoomLevel, stepToWheelFactorRangesMap } from 'constants/zoomFactors';

const isCurrentZoomFactorInRange = (zoomFactor, ranges) => {
  if (ranges[0] === null) {
    return zoomFactor <= ranges[1];
  }
  if (ranges[1] === null) {
    return zoomFactor >= ranges[0];
  }
  return zoomFactor >= ranges[0] && zoomFactor <= ranges[1];
};

export const getStep = (currentZoomFactor) => {
  const steps = Object.keys(stepToZoomFactorRangesMap);
  const step = steps.find((step) => {
    const zoomFactorRanges = stepToZoomFactorRangesMap[step];
    return isCurrentZoomFactorInRange(currentZoomFactor, zoomFactorRanges);
  });

  return parseFloat(step);
};

export const getWheelStep = (currentZoomFactor) => {
  const steps = Object.keys(stepToWheelFactorRangesMap);
  const step = steps.find((step) => {
    const zoomFactorRanges = stepToWheelFactorRangesMap[step];
    return isCurrentZoomFactorInRange(currentZoomFactor, zoomFactorRanges);
  });

  return parseFloat(step);
};

const getViewCenterAfterScale = (scale) => {
  const documentContainer = document.getElementsByClassName('DocumentContainer')[0];
  const documentWrapper = document.getElementsByClassName('document')[0];
  const clientX = window.innerWidth / 2;
  const clientY = window.innerHeight / 2;

  const x =
    (clientX + documentContainer.scrollLeft - documentWrapper.offsetLeft) * scale -
    clientX +
    documentContainer.offsetLeft;
  const y =
    (clientY + documentContainer.scrollTop - documentWrapper.offsetTop) * scale - clientY + documentContainer.offsetTop;

  return { x, y };
};

export const zoomTo = (newZoomFactor) => {
  const currentZoomFactor = core.getZoom();
  const scale = newZoomFactor / currentZoomFactor;
  const { x, y } = getViewCenterAfterScale(scale);

  core.zoomTo(newZoomFactor, x, y);
};

export const zoomIn = () => {
  const currentZoomFactor = core.getZoom();
  if (currentZoomFactor === getMaxZoomLevel()) {
    return;
  }

  const step = getStep(currentZoomFactor);
  const newZoomFactor = currentZoomFactor + step;
  zoomTo(Math.min(newZoomFactor, getMaxZoomLevel()));
};

export const zoomOut = () => {
  const currentZoomFactor = core.getZoom();
  if (currentZoomFactor === getMinZoomLevel()) {
    return;
  }

  const step = getStep(currentZoomFactor);
  const newZoomFactor = currentZoomFactor - step;
  zoomTo(Math.max(newZoomFactor, getMinZoomLevel()));
};

export const fitToHeight = () => {
  core.fitToPage();
};

export const fitToWidth = () => {
  core.fitToWidth();
};

const MINIMUM_SCROLL_AMOUNT = -10;
const MAXIMUM_SCROLL_AMOUNT = 10;
export const getZoomFactorForWheel = (deltaY) => {
  const currentZoomFactor = core.getZoom();
  let newZoomFactor = currentZoomFactor;
  const step = -getWheelStep(currentZoomFactor) * clamp(deltaY, MINIMUM_SCROLL_AMOUNT, MAXIMUM_SCROLL_AMOUNT);

  if (deltaY < 0) {
    newZoomFactor = Math.min(currentZoomFactor + step, getMaxZoomLevel());
  } else if (deltaY > 0) {
    newZoomFactor = Math.max(currentZoomFactor + step, getMinZoomLevel());
  }
  return newZoomFactor;
};