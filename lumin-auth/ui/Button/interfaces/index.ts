import React from 'react';
import { ButtonBaseProps, LinkBaseProps } from '@mui/material';

import { IButtonSize } from '../utils/button-size-transformer';
import { ButtonColor } from '../types';
import { ThemeMode } from '../../theme';

export interface ICustomButtonProps {
  children?: React.ReactNode;
  className?: string;
  loading?: boolean;
  size?: IButtonSize;
  color?: ButtonColor;
  labelColor?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  component?: React.ElementType;
  icon?: string | React.ReactElement;
  themeMode?: ThemeMode;
  width?: number;
}

export type TButtonProps = Partial<Omit<LinkBaseProps, 'width'>> & Omit<ButtonBaseProps, 'width' | 'size' | 'color'> & ICustomButtonProps;
