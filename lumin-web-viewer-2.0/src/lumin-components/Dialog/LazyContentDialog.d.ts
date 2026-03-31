import React from 'react';

export interface LazyContentDiaLogProps extends Record<string, unknown> {
  title?: React.ReactNode;
  fallback: React.ReactElement;
  children: React.ReactNode;
  isReskin?: boolean;
}

declare const LazyContentDiaLog: React.FC<LazyContentDiaLogProps>;

export default LazyContentDiaLog;
