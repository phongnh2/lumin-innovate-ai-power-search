import { LinkBaseProps } from '@mui/material';
import { ElementType, HTMLAttributes, ReactNode } from 'react';

import { IResponsiveSize } from '@/ui/utils';

export type TextLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type TextVariantType = 'primary' | 'neutral' | 'secondary' | 'highlight' | 'error';

export type TextProps = Partial<LinkBaseProps> &
  HTMLAttributes<any> & {
    children?: ReactNode;
    level?: TextLevel | IResponsiveSize<TextLevel>;
    variant?: TextVariantType;
    align?: 'left' | 'right' | 'center' | 'justify';
    className?: string;
    bold?: boolean;
    underline?: boolean;
    ellipsis?: boolean;
    htmlFor?: string;
    as?: ElementType<any> | undefined;
    underlineOnHover?: boolean;
    fontWeight?: number;
  };
