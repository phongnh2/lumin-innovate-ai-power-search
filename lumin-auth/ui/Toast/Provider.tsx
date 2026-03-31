import { SnackbarProvider as BaseSnackbarProvider, SnackbarProviderProps } from 'notistack';
import { ReactNode } from 'react';

import ToastError from './ToastError';
import ToastSuccess from './ToastSuccess';

interface IProviderProps extends SnackbarProviderProps {
  children: ReactNode;
}

const SnackbarProvider = (props: IProviderProps) => {
  const { children, anchorOrigin, ...otherProps } = props;
  return (
    <BaseSnackbarProvider
      {...otherProps}
      Components={{
        success: ToastSuccess,
        error: ToastError
      }}
      anchorOrigin={
        anchorOrigin || {
          vertical: 'top',
          horizontal: 'right'
        }
      }
    >
      {children}
    </BaseSnackbarProvider>
  );
};

export default SnackbarProvider;
