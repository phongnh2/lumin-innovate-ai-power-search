import { css } from '@emotion/react';
import React, { forwardRef, isValidElement } from 'react';

import Icomoon from '../Icomoon';
import Loading from '../Loading';

import { TButtonProps } from './interfaces';
import { ButtonSize, ButtonColor } from './types';

import * as Styled from './Button.styled';

const Button = forwardRef((props: TButtonProps, ref: React.Ref<HTMLButtonElement>) => {
  const { children, className, labelColor, loading, size, color, disabled, fullWidth, icon, ...otherProps } = props;

  return (
    <Styled.Button
      className={className}
      disabled={loading || disabled}
      ref={ref}
      labelColor={labelColor}
      fullWidth={fullWidth}
      size={size}
      color={color}
      {...otherProps}
    >
      {loading && (
        <Styled.LoadingContainer>
          <Loading />
        </Styled.LoadingContainer>
      )}
      <Styled.ChildrenContainer loading={Boolean(loading)}>
        {icon &&
          (isValidElement(icon) ? (
            icon
          ) : (
            <Icomoon
              type={String(icon)}
              size={16}
              css={css`
                margin-right: 8px;
              `}
            />
          ))}
        {children}
      </Styled.ChildrenContainer>
    </Styled.Button>
  );
});

Button.defaultProps = {
  className: '',
  loading: false,
  size: ButtonSize.LG,
  color: ButtonColor.PRIMARY_DARK,
  labelColor: '',
  disabled: false,
  fullWidth: false,
  icon: '',
  type: 'button'
};

export default Button;
