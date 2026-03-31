import core from 'core';

import i18n from 'helpers/i18n';

import { toastUtils } from 'utils';

import { ZOOM_THRESHOLD } from 'constants/zoomFactors';

export const handleZoom = (value) => {
  const _value = value / 100;
  core.setZoomLevel(_value);
};

export const onZoomValueSubmit = (value) => {
  const isLower = value < ZOOM_THRESHOLD.MIN;
  const isHigher = value > ZOOM_THRESHOLD.MAX;
  if (isLower || isHigher) {
    const toastSettings = {
      message: i18n.t('viewer.zoomButton.toastMessage', {
        minZoomThreshold: ZOOM_THRESHOLD.MIN,
        maxZoomThreshold: ZOOM_THRESHOLD.MAX,
      }),
    };
    toastUtils.error(toastSettings);
  }
  let _value = value;

  switch (true) {
    case isLower:
      _value = ZOOM_THRESHOLD.MIN;
      break;

    case isHigher:
      _value = ZOOM_THRESHOLD.MAX;
      break;

    default:
      break;
  }

  handleZoom(_value);
};
