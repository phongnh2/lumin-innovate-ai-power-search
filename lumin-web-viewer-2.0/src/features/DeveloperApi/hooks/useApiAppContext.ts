import { useContext } from 'react';

import { ApiAppContext } from '../context';

export const useApiAppContext = () => {
  const context = useContext(ApiAppContext);

  if (!context) {
    throw new Error('useApiAppContext must be used within an ApiAppContext.Provider');
  }

  return context;
};
