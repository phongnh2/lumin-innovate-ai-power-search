/* eslint-disable no-void */
import { googleServices } from 'services';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

interface IError {
  message: string;
}

export default (): void => {
  void googleServices.implicitSignIn({
    callback: () => {
      logger.logInfo({
        message: LOGGER.EVENT.HANDLE_SIGN_IN_DRIVE_REQUIRED_ERROR,
        reason: LOGGER.Service.GOOGLE_API_INFO,
      });
      window.location.reload();
    },
    onError: (error: IError) => {
      logger.logError({
        reason: LOGGER.Service.GOOGLE_API_ERROR,
        error,
      });
    },
    prompt: 'select_account',
  });
};
