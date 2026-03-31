import React, { createContext, useCallback, useMemo, useRef } from 'react';

interface TopFeaturesSectionContextType {
  registerPopper: (id: string, closeFunction: () => void) => void;
  unregisterPopper: (id: string) => void;
  closeAllPoppers: () => void;
}

const TopFeaturesSectionContext = createContext<TopFeaturesSectionContextType | undefined>(undefined);
interface TopFeaturesSectionProviderProps {
  children: React.ReactNode;
}

export const TopFeaturesSectionProvider: React.FC<TopFeaturesSectionProviderProps> = ({ children }) => {
  const poppersRef = useRef<Map<string, () => void>>(new Map());

  const registerPopper = useCallback((id: string, closeFunction: () => void) => {
    poppersRef.current.set(id, closeFunction);
  }, []);

  const unregisterPopper = useCallback((id: string) => {
    poppersRef.current.delete(id);
  }, []);

  const closeAllPoppers = useCallback(() => {
    poppersRef.current.forEach((closeFunction) => {
      closeFunction();
    });
  }, []);

  const value = useMemo(
    () => ({
      registerPopper,
      unregisterPopper,
      closeAllPoppers,
    }),
    [registerPopper, unregisterPopper, closeAllPoppers]
  );

  return <TopFeaturesSectionContext.Provider value={value}>{children}</TopFeaturesSectionContext.Provider>;
};

export default TopFeaturesSectionContext;
