import { forwardRef, Ref } from 'react';

import Icomoon from '../Icomoon';
import { Colors } from '../theme';

import ToastBase, { ICustomToastProps } from './ToastBase';

import { errorCss } from './Toast.styled';

const ToastError = forwardRef((props: ICustomToastProps, ref: Ref<any>) => {
  return <ToastBase css={errorCss} {...props} ref={ref} icon={<Icomoon type='cancel-circle' size={18} color={Colors.SECONDARY_60} />} />;
});

export default ToastError;
