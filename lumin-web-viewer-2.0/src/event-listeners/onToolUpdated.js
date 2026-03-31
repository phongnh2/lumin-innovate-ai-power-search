import actions from 'actions';
import core from 'core';

import localStorageManager from 'helpers/localStorageManager';
import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';
import { ERROR_MESSAGE_PDFTRON } from 'constants/messages';

const storeStyle = (toolName, toolStyles) => {
  try {
    localStorage.setItem(`toolData-${toolName}`, JSON.stringify(toolStyles));
  } catch (err) {
    logger.logError({
      message: `${ERROR_MESSAGE_PDFTRON.UNACCESS_LOCALSTORAGE} ${err.message}`,
      reason: LOGGER.Service.PDFTRON,
    });
  }
};

export default (dispatch) => (tool) => {
  const toolName = tool.name;
  const toolStyles = tool.defaults;

  if (toolStyles && localStorageManager.isLocalStorageEnabled()) {
    storeStyle(toolName, toolStyles);
  }

  const currentTool = core.getToolMode();
  if (currentTool && currentTool.name === toolName) {
    dispatch(actions.setActiveToolStyles(toolStyles));
  }
};
