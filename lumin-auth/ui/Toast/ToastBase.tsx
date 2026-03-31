import { SnackbarContent, CustomContentProps, closeSnackbar } from 'notistack';
import { forwardRef, ReactElement } from 'react';

import Icomoon from '../Icomoon';

import { closeButtonContainerCss, containerCss } from './Toast.styled';

export interface ICustomToastProps extends CustomContentProps {
  icon: ReactElement;
}

const ToastBase = forwardRef<HTMLDivElement, ICustomToastProps>((props, ref) => {
  const { id, message, className, icon } = props;

  const close = () => closeSnackbar(id);

  return (
    <SnackbarContent ref={ref} role='alert' key={id}>
      <div css={containerCss} className={className}>
        {icon}
        {message}
        <div css={closeButtonContainerCss} onClick={close}>
          <Icomoon type='cancel' size={14} />
        </div>
      </div>
    </SnackbarContent>
  );
});

export default ToastBase;
