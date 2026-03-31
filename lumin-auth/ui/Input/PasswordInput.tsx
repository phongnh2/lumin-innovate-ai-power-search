import { forwardRef, useState } from 'react';

import useTranslation from '@/hooks/useTranslation';

import Icomoon from '../Icomoon';
import Tooltip from '../Tooltip';

import Input from './Input';
import { InputProps } from './interfaces';

import * as Styled from './Input.styled';

export type PasswordInputProps = {
  readOnly?: boolean;
  hideIcon?: boolean;
} & InputProps;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { hideIcon, readOnly } = props;
  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      ref={ref}
      icon={!hideIcon && 'lock'}
      iconRight={
        !readOnly && (
          <Tooltip title={showPassword ? t('authPage.hidePassword') : t('authPage.showPassword')}>
            <Styled.PasswordIcon role='button' tabIndex={-1} onClick={() => setShowPassword(!showPassword)}>
              <Icomoon type={showPassword ? 'eye-close' : 'eye-open'} size={16} />
            </Styled.PasswordIcon>
          </Tooltip>
        )
      }
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

PasswordInput.defaultProps = {
  readOnly: undefined,
  hideIcon: false
};

export default PasswordInput;
