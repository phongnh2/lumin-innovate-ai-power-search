import React, { MouseEvent, ReactNode } from 'react';

interface IProps {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled: boolean;
  toolName: string;
  children?: ReactNode;
  disabled?: boolean;
  eventName?: string;
}

declare const PopperLimitWrapper: React.FC<IProps>;

export default PopperLimitWrapper;
