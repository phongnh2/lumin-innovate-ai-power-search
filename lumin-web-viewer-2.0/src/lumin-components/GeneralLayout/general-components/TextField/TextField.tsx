import InputAdornment from '@mui/material/InputAdornment';
import { InputBaseProps } from '@mui/material/InputBase';
import { isNumber } from 'lodash';
import React, { isValidElement } from 'react';
import { useTheme } from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';

import * as Styled from './TextField.styled';

const ICON_SIZE = {
  medium: 24,
  large: 24,
  small: 16,
};

interface TextFieldProps extends Omit<InputBaseProps, 'size'> {
  size?: 'medium' | 'small' | 'large';
  prefixProps?: React.ComponentProps<typeof Icomoon>;
  suffixProps?: React.ComponentProps<typeof Icomoon>;
  showSuffix?: boolean;
  showPrefix?: boolean;
  errorText?: string;
  label?: string | React.ReactNode;
  error?: boolean;
  suffixSize?: number;
  variant?: 'autocomplete' | 'input';
  rootRef?: React.Ref<HTMLDivElement>;
}

/**
 *
 * @param {{
 *  size: "medium" | "small" | "large";
 *  variant: "autocomplete" | "input";
 * }} props
 *
 */
const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      size,
      prefixProps,
      suffixProps,
      showSuffix,
      showPrefix,
      errorText,
      error,
      label,
      suffixSize,
      variant,
      rootRef,
      ...props
    },
    ref
  ) => {
    const theme = useTheme() as Record<string, string>;
    const classes = Styled.useStyles({ theme, $size: size, $variant: variant });

    const getSize = () => {
      if (Object.keys(ICON_SIZE).includes(size)) {
        return ICON_SIZE[size];
      }
      if (!isNumber(size)) {
        throw new Error('Invalid size');
      }
      return size;
    };

    const renderExtra = () => {
      const res = {};

      if (showPrefix) {
        Object.assign(res, {
          startAdornment: (
            <InputAdornment position="start">
              <Icomoon size={getSize()} {...prefixProps} />
            </InputAdornment>
          ),
        });
      }

      if (showSuffix) {
        Object.assign(res, {
          endAdornment: (
            <InputAdornment position="end">
              <Icomoon size={suffixSize} {...suffixProps} />
            </InputAdornment>
          ),
        });
      }

      return res;
    };

    const renderLabel = () => {
      if (!label) {
        return null;
      }

      if (isValidElement(label)) {
        return label;
      }
      return <Styled.Label>{label}</Styled.Label>;
    };

    return (
      <Styled.TextFieldWrapper className="text-field-wrapper">
        {renderLabel()}
        <Styled.TextField
          {...props}
          classes={classes}
          $size={size}
          error={error}
          {...(rootRef ? { ref: rootRef } : {})}
          inputRef={ref}
          {...renderExtra()}
        />
        {error && errorText && <Styled.ErrorMessage>{errorText}</Styled.ErrorMessage>}
      </Styled.TextFieldWrapper>
    );
  }
);

TextField.defaultProps = {
  size: 'medium',
  prefixProps: {},
  suffixProps: {},
  showSuffix: false,
  showPrefix: false,
  errorText: '',
  label: '',
  error: false,
  suffixSize: 16,
  variant: 'input',
  rootRef: null,
};

export default TextField;
