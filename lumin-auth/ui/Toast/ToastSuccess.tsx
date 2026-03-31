import { forwardRef, Ref } from 'react';

import Icomoon from '../Icomoon';
import { Colors } from '../theme';

import ToastBase, { ICustomToastProps } from './ToastBase';

import { successCss } from './Toast.styled';

const ToastSuccess = forwardRef((props: ICustomToastProps, ref: Ref<any>) => {
  return <ToastBase css={successCss} {...props} ref={ref} icon={<Icomoon type='success' size={18} color={Colors.PRIMARY_90} />} />;
});

export default ToastSuccess;
