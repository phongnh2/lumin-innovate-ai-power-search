import React from 'react';

export interface IIcomoonProps {
  className?: string | undefined;
  size?: number | string | undefined;
  color?: string | unknown;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | undefined;
  style?: React.CSSProperties | undefined;
}

declare const Icomoon: React.FC<IIcomoonProps>;

export default Icomoon;
