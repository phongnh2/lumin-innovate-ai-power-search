import React from 'react';

export interface ILoadingProps {
  fullscreen?: boolean;
  normal?: boolean;
  className?: string;
  size?: number;
  reskinSize?: string;
  useReskinCircularProgress?: boolean;
  color?: string;
  containerStyle?: Record<string, unknown>;
}

declare const Loading: React.FC<ILoadingProps>;

export default Loading;
