import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import logger from 'helpers/logger';

import { exitFullScreen, isInFullScreen, requestFullScreen } from './fullScreenAPI';

const { dispatch } = store;

export const toggleFullScreenMode = () => {
  if (isInFullScreen()) {
    exitFullScreen(document).catch((error) => {
      logger.logError({
        message: 'Failed to exit full screen',
        error: error as Error,
      });
    });
    return;
  }

  requestFullScreen(document.documentElement)
    .then(() => {
      dispatch(actions.setFullScreen(true) as AnyAction);
    })
    .catch((error) => {
      logger.logError({
        message: 'Failed to request full screen',
        error: error as Error,
      });
    });
};
