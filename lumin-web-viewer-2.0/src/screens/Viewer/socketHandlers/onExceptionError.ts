import { Dispatch, AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import logger from 'helpers/logger';

import { ErrorCode } from 'constants/errorCode';
import { LOGGER } from 'constants/lumin-common';

import { IUser } from 'interfaces/user/user.interface';

interface Error {
  code: string;
  message: string;
  response?: string;
  status?: number;
}

export default (dispatch: Dispatch) => (error: Error) => {
  if (error.code === ErrorCode.Common.INVALID_IP_ADDRESS) {
    const { email } = selectors.getCurrentUser(store.getState()) as IUser;
    dispatch(actions.setWrongIpStatus({ open: true, email }) as AnyAction);
  } else {
    logger.logError({
      reason: LOGGER.Service.COMMON_ERROR,
      error,
    });
  }
};
