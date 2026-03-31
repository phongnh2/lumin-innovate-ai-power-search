import React from 'react';

export function withPanelStyles<T extends Record<string, unknown>>(Component: React.ComponentType<T>) {
  return (props: T) => (
    <Component
      {...props}
      style={{
        width: '100%',
        height: '100%',
        ...((props.style as Record<string, unknown>) || {}),
      }}
    />
  );
}
