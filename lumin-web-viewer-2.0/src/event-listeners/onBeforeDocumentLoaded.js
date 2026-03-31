import actions from 'actions';
import core from 'core';

import { isIOS } from 'helpers/device';

export default (dispatch) => () => {
  // if we are opening an password-protected pdf,
  // this event will only be trigger after we enter the correct password, so it's safe to close this modal here
  dispatch(actions.closeElement('passwordModal'));

  if (isIOS) {
    // enough so that we can enable high res thumb
    core.CoreControls.setPreRenderLevel(2);
  }

  const currentPage = core.getCurrentPage();
  dispatch(actions.setCurrentPage(currentPage));
};
