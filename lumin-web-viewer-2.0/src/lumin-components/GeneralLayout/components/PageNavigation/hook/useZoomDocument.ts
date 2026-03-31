/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useState } from 'react';

import core from 'core';

import { useTranslation } from 'hooks';

import { zoomOut, zoomIn } from 'helpers/zoom';

import { toastUtils } from 'utils';

import { ZOOM_THRESHOLD } from 'constants/zoomFactors';

import { IUseZoomDocument } from '../interface';

export enum ZoomTypes {
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_OUT = 'ZOOM_OUT',
}

const useZoomDocument = (): IUseZoomDocument => {
  const [currentZoomLevel, setCurrentZoomLevel] = useState(100);
  const { t } = useTranslation();

  const getZoomLevelFromRatio = (ratio: number): number => parseFloat((ratio * 100).toFixed(0));
  const getRatioFromZoomLevel = (zoomLevel: number): number => zoomLevel / 100;

  const validatedZoomInput = (zoomLevel: number): boolean =>
    zoomLevel >= ZOOM_THRESHOLD.MIN && zoomLevel <= ZOOM_THRESHOLD.MAX;
  const getValidZoomLevel = (zoomLevel: string, shouldToastError: false): number => {
    const zoomValue = Number(zoomLevel.split('%')[0]);

    if (!validatedZoomInput(zoomValue)) {
      const toastSettings = {
        message: t('viewer.zoomButton.toastMessage', {
          minZoomThreshold: ZOOM_THRESHOLD.MIN,
          maxZoomThreshold: ZOOM_THRESHOLD.MAX,
        }),
      };
      if (shouldToastError) {
        toastUtils.error(toastSettings);
      }
      return currentZoomLevel;
    }
    return zoomValue;
  };

  const getDefaultZoomLevel = (): number => getZoomLevelFromRatio(core.getZoom());

  const setDefaultZoomLevel = (): void => {
    setCurrentZoomLevel(getDefaultZoomLevel());
  };

  const onZoomUpdated = (): void => {
    setDefaultZoomLevel();
  };

  const onZoomByAction = (action: ZoomTypes): void => {
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

  useEffect(() => {
    setCurrentZoomLevel(getDefaultZoomLevel());
    core.addEventListener('zoomUpdated', onZoomUpdated);
    return () => {
      core.removeEventListener('zoomUpdated', onZoomUpdated);
    };
  }, []);

  return {
    validatedZoomInput,
    getDefaultZoomLevel,
    getValidZoomLevel,
    onZoomByAction,
    getRatioFromZoomLevel,
    getZoomLevelFromRatio,
    currentZoomLevel,
  };
};

export default useZoomDocument;
