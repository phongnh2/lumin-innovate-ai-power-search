/**
 * Sets zoom level.
 * @method WebViewerInstance#setZoomLevel
 * @param {(string|number)} zoomLevel Zoom level in either number or percentage.
 * @example
WebViewer(...)
  .then(function(instance) {
    var docViewer = instance.docViewer;

    // you must have a document loaded when calling this api
    docViewer.on('documentLoaded', function() {
      instance.setZoomLevel('150%'); // or setZoomLevel(1.5)
    });
  });
 */

import core from 'core';

import getActualZoomLevel from 'helpers/getActualZoomLevel';
import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_PDFTRON } from 'constants/messages';

export default (zoomLevel: number): void => {
  zoomLevel = getActualZoomLevel(zoomLevel);

  if (zoomLevel) {
    core.zoomTo(zoomLevel);
  } else {
    logger.logInfo({
      message: ERROR_MESSAGE_PDFTRON.INVALID_SET_ZOOM,
      reason: LOGGER.Service.PDFTRON,
    });
  }
};
