import * as React from 'react';

export type CircularProgressbarStyles = {
  root?: React.CSSProperties;
  trail?: React.CSSProperties;
  path?: React.CSSProperties;
  text?: React.CSSProperties;
  background?: React.CSSProperties;
};

export type CircularProgressbarDefaultProps = {
  background: boolean;
  backgroundPadding: number;
  circleRatio: number;
  classes: {
    root: string;
    trail: string;
    path: string;
    text: string;
    background: string;
  };
  className: string;
  counterClockwise: boolean;
  maxValue: number;
  minValue: number;
  strokeWidth: number;
  styles: CircularProgressbarStyles;
  text: string;
};

export type CircularProgressbarWrapperProps = {
  circleRatio?: number;
  classes?: {
    root: string;
    trail: string;
    path: string;
    text: string;
    background: string;
  };
  className?: string;
  maxValue?: number;
  minValue?: number;
  strokeWidth?: number;
  styles?: CircularProgressbarStyles;
  text?: string;
  value: number;
};

export type CircularProgressbarProps = CircularProgressbarDefaultProps & {
  value: number;
};