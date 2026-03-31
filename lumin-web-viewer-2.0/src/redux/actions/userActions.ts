import { Dispatch } from 'redux';

import { IUser } from 'interfaces/user/user.interface';

export const updateUserMetadata = (payload: Partial<IUser['metadata']>) => (dispatch: Dispatch) => {
  dispatch({
    type: 'UPDATE_USER_METADATA',
    payload,
  });
};
