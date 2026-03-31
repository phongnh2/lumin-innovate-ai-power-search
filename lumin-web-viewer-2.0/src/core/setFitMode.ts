/**
 * Sets the fit mode of the viewer.
 * @method WebViewerInstance#setFitMode
 * @param {string} fitMode Fit mode of WebViewer.
 * @see WebViewerInstance#FitMode
 * @example
WebViewer(...)
  .then(function(instance) {
    var docViewer = instance.docViewer;
    var FitMode = instance.FitMode;

    // you must have a document loaded when calling this api
    docViewer.on('documentLoaded', function() {
      instance.setFitMode(FitMode.FitWidth);
    });
  });
 */

import core from 'core';

import logger from 'helpers/logger';

import FitMode from 'constants/fitMode';
import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_PDFTRON } from 'constants/messages';

export default (mode: string): void => {
  const fitModeToFunctionMap = {
    [FitMode.FitWidth]: core.fitToWidth,
    [FitMode.FitPage]: core.fitToPage,
    [FitMode.Zoom]: core.fitToZoom,
  };
  const fitFunction = fitModeToFunctionMap[mode];

  if (!fitFunction) {
    logger.logInfo({
      message: `${ERROR_MESSAGE_PDFTRON.UNSUPPORTED_FIT_MODE}: ${mode}`,
      reason: LOGGER.Service.PDFTRON,
    });
    return;
  }

  fitFunction();
};
