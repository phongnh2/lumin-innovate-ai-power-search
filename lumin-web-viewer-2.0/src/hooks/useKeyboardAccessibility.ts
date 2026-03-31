import React, { useCallback } from 'react';

const useKeyboardAccessibility = <T = HTMLElement>() => {
  const onKeyDown = useCallback((e: React.KeyboardEvent<T>) => {
    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
      (e.currentTarget as unknown as HTMLElement).click();
    }
  }, []);

  return { onKeyDown };
};

export default useKeyboardAccessibility;
