import core from 'core';

import { ERROR_MESSAGE_PDFTRON } from 'constants/messages';

import logger from './logger';

export default (clipboardData) => {
  if (clipboardData && clipboardData instanceof window.DataTransfer) {
    clipboardData.clearData('text/html');
    clipboardData.setData('text/plain', core.getSelectedText());
  } else if (window.clipboardData) {
    window.clipboardData.setData('Text', core.getSelectedText());
  } else {
    const textarea = document.getElementById('copy-textarea');
    textarea.value = core.getSelectedText();
    textarea.select();
    textarea.setSelectionRange(0, 99999); // this is necessary for iOS
    try {
      document.execCommand('copy');
      textarea.blur();
    } catch (e) {
      logger.logError({
        reason: ERROR_MESSAGE_PDFTRON.UNSUPPORTED_COPY_TEXT,
        error: e,
      });
    }
  }
};
