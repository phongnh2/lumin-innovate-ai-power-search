import React, { useMemo, useReducer } from 'react';

import { ChooseFileContext } from './contexts/ChooseFile.context';
import { chooseFileReducer, initialState } from './reducers/ChooseFile.reducer';

export const ChooseFileProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(chooseFileReducer, initialState);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <ChooseFileContext.Provider value={contextValue}>{children}</ChooseFileContext.Provider>;
};
