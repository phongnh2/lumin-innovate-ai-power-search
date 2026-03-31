import { ButtonProps } from '@mui/material';
import { LinkProps } from 'react-router-dom';

import type { IButtonSize } from 'utils/styles/SizeTransformer';

import { ButtonColor } from './types/ButtonColor';

export type ButtonMaterialProps = Partial<LinkProps> &
  Omit<ButtonProps, 'size' | 'color'> & {
    children: React.ReactNode;
    className?: string;
    loading?: boolean;
    size?: IButtonSize;
    color?: ButtonColor;
    labelColor?: string;
    classes?: Record<string, unknown>;
    disabled?: boolean;
    fullWidth?: boolean;
    component?: React.ElementType;
  };
