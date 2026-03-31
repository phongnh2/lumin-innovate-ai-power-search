export interface ZoomThreshold {
  MIN: number;
  MAX: number;
}

export const ZOOM_THRESHOLD: ZoomThreshold;

export function getMinZoomLevel(): number;
export function setMinZoomLevel(zoom: number): number;
export function getMaxZoomLevel(): number;
export function setMaxZoomLevel(zoom: number): number;

export interface RangeMap {
  [step: string]: [number, number | null];
}

export const stepToZoomFactorRangesMap: RangeMap;
export const stepToWheelFactorRangesMap: RangeMap;

declare const zoomFactors: {
  setMinZoomLevel: typeof setMinZoomLevel;
  setMaxZoomLevel: typeof setMaxZoomLevel;
  getMinZoomLevel: typeof getMinZoomLevel;
  getMaxZoomLevel: typeof getMaxZoomLevel;
};

export default zoomFactors;
