import debounce from 'lodash/debounce';
import core from 'core';
import actions from 'actions';
import { isAndroid } from 'helpers/device';
import fireEvent from 'helpers/fireEvent';

const DEBOUNCE_TIME = 100;

export default (dispatch) => debounce((fitMode) => {
  if (fitMode === core.docViewer.FitMode.Zoom) {
    dispatch(actions.setFitMode('Zoom'));
  } else if (fitMode === core.docViewer.FitMode.FitWidth) {
    dispatch(actions.setFitMode('FitWidth'));
  } else if (fitMode === core.docViewer.FitMode.FitPage) {
    // In Android, if you focus on an input field, it brings up virtual keyboard,
    // and page gets re-rendered, which blurs out.
    // To prevent that, we change the fit mode to Zoom.
    if (isAndroid) {
      core.fitToZoom();
    }
    dispatch(actions.setFitMode('FitPage'));
  }

  fireEvent('fitModeChanged', [fitMode]);
}, DEBOUNCE_TIME);
