import { SerializedStyles } from '@emotion/react';
import { HTMLAttributes, ReactNode } from 'react';

export interface IGapProps extends HTMLAttributes<HTMLDivElement> {
  level?: number;
  children?: ReactNode;
  fullWidth?: boolean;
  css?: SerializedStyles;
}
