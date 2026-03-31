import { isUndefined } from 'lodash';
import { enqueueSnackbar as enqueueSnackbarUI, closeSnackbar as closeSnackbarUI } from 'lumin-ui/kiwi-ui';

type SnackbarOptions = Parameters<typeof enqueueSnackbarUI>[0];

const defaultDuration = 3000;

export const enqueueSnackbar = (params: SnackbarOptions): ReturnType<typeof enqueueSnackbarUI> => {
  const { autoHideDuration, ...rest } = params;
  return enqueueSnackbarUI({
    ...rest,
    autoHideDuration: isUndefined(autoHideDuration) ? defaultDuration : autoHideDuration,
  });
};

export const closeSnackbar = (key?: string) => closeSnackbarUI(key);
