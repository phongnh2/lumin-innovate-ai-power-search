/* eslint-disable @typescript-eslint/ban-ts-comment */
import Button from '@mui/material/Button';
import { get } from 'lodash';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';

import Loading from 'lumin-components/Loading';

import { useThemeMode } from 'hooks/useThemeMode';

import themeConstants from 'constants/theme';

import { ButtonMaterialProps } from './ButtonMaterial.interface';
import { ButtonColor } from './types/ButtonColor';
import { ButtonSize } from './types/ButtonSize';

import * as Styled from './ButtonMaterial.styled';

const defaultProps = {
  className: '',
  loading: false,
  size: ButtonSize.MD,
  color: ButtonColor.PRIMARY_RED,
  labelColor: '',
  classes: {},
  disabled: false,
  fullWidth: false,
};

const ButtonMaterial = React.forwardRef((props: ButtonMaterialProps, ref) => {
  const { children, className, labelColor, classes, loading, size, color, disabled, fullWidth, ...otherProps } = props;
  const themeMode = useThemeMode();
  const theme = useTheme();
  const customClasses = Styled.useStyles({
    labelColor,
    color,
    size,
    loading,
    themeMode,
    fullWidth,
    theme,
  });

  const newClasses = useMemo<Record<string, unknown>>(
    () => themeConstants.Button.buttonClassBuilder(customClasses, classes) as Record<string, unknown>,
    [customClasses, classes]
  );

  const loadingColor =
    labelColor || get(themeConstants.Button.buttonColorGetter({ color, theme }), 'disabled.color') as string;

  return (
    // @ts-ignore
    <Button
      classes={newClasses}
      className={className}
      disabled={loading || disabled}
      ref={ref}
      variant="contained"
      {...otherProps}
    >
      {loading && (
        <Styled.LoadingContainer>
          <Loading
            // @ts-ignore
            normal
            color={loadingColor}
            size={20}
          />
        </Styled.LoadingContainer>
      )}
      <Styled.ChildrenContainer $loading={loading}>{children}</Styled.ChildrenContainer>
    </Button>
  );
});

ButtonMaterial.defaultProps = defaultProps;

export default ButtonMaterial;
