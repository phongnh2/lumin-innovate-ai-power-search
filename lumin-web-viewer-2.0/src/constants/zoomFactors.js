export const ZOOM_THRESHOLD = {
  MIN: 5,
  MAX: 9999,
};

let minZoom = ZOOM_THRESHOLD.MIN / 100;
let maxZoom = ZOOM_THRESHOLD.MAX / 100;

export const getMinZoomLevel = () => minZoom;

export const setMinZoomLevel = (zoom) => (minZoom = zoom);

export const getMaxZoomLevel = () => maxZoom;

export const setMaxZoomLevel = (zoom) => (maxZoom = zoom);

export const stepToZoomFactorRangesMap = {
  0.075: [0, 0.8],
  0.125: [0.8, 1.5],
  0.25: [1.5, 2.5],
  0.5: [2.5, null],
};

export const stepToWheelFactorRangesMap = {
  0.005: [0, 0.5],
  0.02: [0.5, 2.5],
  0.04: [2.5, null],
};

export default {
  setMinZoomLevel,
  setMaxZoomLevel,
  getMinZoomLevel,
  getMaxZoomLevel,
};
